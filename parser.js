const csv_parser = require("csv-parser");
const fastcsv = require("fast-csv");

const csv = require("csvtojson");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const fs = require("fs");

const { readFile } = require("fs");

const { questions } = require("./FSquestions");
const { answers } = require("./FSanswers");

const { productIDModel } = require("./NoSQLSchema");
const { db } = require("./mongo");
const { resolve } = require("path");

// {
//   id: '99',
//   product_id: '29',
//   body: 'Error nihil delectus tempora dolores asperiores.',
//   date_written: '2019-04-14',
//   asker_name: 'Taryn.Lebsack24',
//   asker_email: 'Avery.Gerhold34@gmail.com',
//   reported: '0',
//   helpful: '5'
// },
// {
//   id: '100',
//   product_id: '30',
//   body: 'Ipsum assumenda ipsum.',
//   date_written: '2019-07-13',
//   asker_name: 'Collin.Cruickshank61',
//   asker_email: 'Winston.Abernathy49@yahoo.com',
//   reported: '0',
//   helpful: '0'
// },

/*  */

/*  STAGE 1 */

/* this function gets the headers from the dir file /QA-CSV-Headers/questionsHeaders.csv */
const getQuestionsHeaders = async () => {
  return new Promise((resolve, reject) => {
    csv({
      noheader: true,
    })
      .fromFile(__dirname + "/QA-CSV-Headers/questionsHeaders.csv")
      .then((jsonHeaders) => {
        resolve(jsonHeaders);
      });
  });
};

/* 

  this function is the bread/butter, 

  it reads the 3 mil+ csv file and 
  it takes in that data,
  seprates them into 4 different files,
  then spits them out in testCsvMaker

*/
const makeCsv = () => {
  csv()
    .fromFile(__dirname + "/QA-CSV-Files/questions.csv")
    .then(async (jsonObj) => {
      let headers = await getQuestionsHeaders();

      const eachFractionLength = Math.ceil(jsonObj.length / 4);

      for (let i = 1; i <= 4; i++) {
        let csvObjChunk = jsonObj.splice(0, eachFractionLength);

        const ws = fs.createWriteStream(
          `${__dirname}/testCsvMaker/questions${i}.csv`
        );
        fastcsv.write(csvObjChunk, { headers: true }).pipe(ws);
      }
    });
};

// makeCsv();

const readAllFiles = () => {
  // returns 4 promises with all the data
  let data = [];

  for (let i = 1; i <= 4; i++) {
    // readFile(__dirname + `/testCsvMaker/questions${i}.csv`, "utf8", (err, data) => {
    //   if (err) throw err;

    //   console.log(data)
    // });

    data.push(
      new Promise((resolve, reject) => {
        csv()
          .fromFile(__dirname + `/testCsvMaker/questions${i}.csv`)
          .then((obj) => {
            resolve(obj);
          });
      })
    );
  }

  return data;
};

let promiseData = readAllFiles();

// productIDModel.bulkWrite(drainer); // syntax for bulkWrite

// {
//   updateOne: {
//     filter,
//     update,
//     upsert: true,
//   }

const getIDs = async (chunk) => {
  return new Promise((resolve, reject) => {
    let idContainer = [];

    for (let i = 0; i < chunk.length; i++) {
      let objID = chunk[i].product_id;
      console.log(objID);
      let filter = { product_id: objID };

      let update = { product_id: objID };

      idContainer.push({
        updateOne: {
          filter,
          update,
          upsert: true,
        },
      });
    }
    // console.log(idContainer)
    productIDModel.bulkWrite(idContainer).then((data) => {
      console.log("first data executed ");
      resolve(data);
    });
    // console.log("bulk writing!");
    // resolve(idContainer);
  });
};

const initiateGetIDs = async (chunkArr) => {
  const chunkArrCopy = [...chunkArr];

  let arrChunks = [];

  const half = Math.ceil(chunkArr.length / 2);

  const firstHalf = chunkArrCopy.splice(0, half);
  const secondHalf = chunkArrCopy.splice(-half);

  arrChunks.push(getIDs(firstHalf));
  arrChunks.push(getIDs(secondHalf));

  return arrChunks;
};

const awaitNextCall = (arrPromiseToWaitForCB, originalArr, arrIndex) => {
  // console.log(arrPromiseToWaitFor);

  let data = arrPromiseToWaitForCB(originalArr[arrIndex]);

  Promise.resolve(data).then((multiArrPromise) => {
    Promise.all(multiArrPromise).then((data) => {
      if (arrIndex === originalArr.length - 1) {
        return;
      }

      arrIndex += 1;

      console.log("^ should see first data executed before next call");
      awaitNextCall(arrPromiseToWaitForCB, originalArr, arrIndex);
    });
  });
};

const resolveAllDataToInjectIntoDb = (promiseArr) => {
  Promise.all(promiseArr).then((data) => {
    //this is 4 chunks of 4 arrays containing all 3 mil csv data

    awaitNextCall(initiateGetIDs, data, 0);

    // const test = initiateGetIDs(data[0]);

    // for (let i = 0; i < data.length; i++) {
    //   initiateGetIDs(data[i]);
    // }

    // Promise.resolve(test).then((promiseArr) => {
    //   // console.log(promiseArr);
    //   Promise.all(promiseArr).then((newArr) => {
    //     console.log("done for now");
    //   });
    // });
  });
};

resolveAllDataToInjectIntoDb(promiseData);

/*  ------ STAGE 1 */

/* 

  {
    id: '37',
    ' product_id': '5',
    ' body': 'Why is this product cheaper here than other sites?',
    ' date_written': '2018-10-18',
    ' asker_name': 'willsmith',
    ' asker_email': 'first.last@gmail.com',
    ' reported': '0',
    ' helpful': '4'
  },
  {
    id: '38',
    ' product_id': '5',
    ' body': 'How long does it last?',
    ' date_written': '2019-06-28',
    ' asker_name': 'funnygirl',
    ' asker_email': 'first.last@gmail.com',
    ' reported': '0',
    ' helpful': '2'
  },

  */
