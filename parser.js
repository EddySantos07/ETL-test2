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
const { resolve4, resolve6, resolveAny } = require("dns");

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

const testQuery = async () => {
  const filter = await productIDModel.updateOne(
    { product_id: "1" },
    { $set: { results: [] } }
  );

  console.log(filter, "filter");
};
// testQuery();
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
      // console.log(objID);
      let filter = { product_id: Number(objID.trim()) };

      let update = {
        product_id: Number(objID.trim()),
      };

      idContainer.push({
        updateOne: {
          filter,
          update,
          upsert: true,
        },
      });
    }
    // console.log(idContainer)
    let count = 1;
    productIDModel.bulkWrite(idContainer).then((data) => {
      if (count === 1) {
        console.log(
          data.matchedCount,
          " matched count",
          data.modifiedCount,
          "modified count"
        );
      }
      console.log("first data executed ");
      resolve(data);
    });
    // console.log("bulk writing!");
    // resolve(idContainer);
  });
};

const insertBodyIntoProductID = (chunk) => {
  console.log('called insert body')
  return new Promise((resolve, reject) => {
    let BodyContainer = [];

    for (let i = 0; i < chunk.length; i++) {
      let objID = chunk[i].product_id;

      let question_id = chunk[i].id;
      let question_body = chunk[i].body;
      let question_date = chunk[i].date_written;
      let asker_name = chunk[i].asker_name;
      let question_helpfulness = chunk[i].helpful;
      let reported = chunk[i].reported;
      let answers = {};

      let filter = { product_id: objID };

      let update = {
        $push: {
          results: {
            question_id,
            question_body,
            question_date,
            asker_name,
            question_helpfulness,
            reported,
            answers,
          },
        },
      };

      BodyContainer.push({
        updateOne: {
          filter,
          update,
          upsert: true,
        },
      });
    }
    productIDModel.bulkWrite(BodyContainer).then((data) => {
      console.log(
        data.matchedCount,
        " matched count",
        data.modifiedCount,
        "modified count"
      );
      console.log("first Body of data executed into product_id");
      resolve(data);
    });
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

const initiateInsertBody = (chunkArr) => {
  const chunkArrCopy = [...chunkArr];

  let arrChunks = [];

  const half = Math.ceil(chunkArr.length / 2);

  const firstHalf = chunkArrCopy.splice(0, half);
  const secondHalf = chunkArrCopy.splice(-half);

  arrChunks.push(insertBodyIntoProductID(firstHalf));
  arrChunks.push(insertBodyIntoProductID(secondHalf));

  return arrChunks;
};

const awaitNextCall = async (arrPromiseToWaitForCB, originalArr, arrIndex) => {
  let chunk = arrPromiseToWaitForCB(originalArr[arrIndex]);

  let promiseChunks = await new Promise((resolve, reject) => {
    Promise.resolve(chunk).then((data) => {
      resolve(data);
    });
  });

  let resolvedChunks = await new Promise((resolve, reject) => {
    Promise.all(promiseChunks).then((data) => {
      resolve(data);
    });
  });

  let callStack; 

  if (arrIndex === originalArr.length - 1) {
    console.log(callStack, ' call stack in if statement')
    return;
  }

  arrIndex += 1;

  callStack = await awaitNextCall(arrPromiseToWaitForCB, originalArr, arrIndex);

  console.log( callStack,  " this is the current call stack!!!");

  // Promise.resolve(data).then((multiArrPromise) => {
  //   Promise.all(multiArrPromise).then((data) => {
  //     if (arrIndex === originalArr.length - 1) {
  //       resolve();
  //       console.log("returning from await call!");
  //       return;
  //     }

  //

  //     console.log("^ should see first data executed before next call");
  //     awaitNextCall(arrPromiseToWaitForCB, originalArr, arrIndex);
  //   });
  // });
};

const resolveAllDataToInjectIntoDb = (promiseArr) => {
  Promise.all(promiseArr).then(async (data) => {
    //this is 4 chunks of 4 arrays containing all 3 mil csv data

    // const wait = await awaitNextCall(initiateGetIDs, data, 0);

    console.log( 'all the promises or promise from recursive calls' )

    // console.log("we can now initiate insert body");
    const wait2 = await awaitNextCall(initiateInsertBody, data, 0);
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
