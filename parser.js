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

/*  */

const testQuery = async () => {
  const filter = await productIDModel.updateOne(
    { product_id: "1" },
    { $set: { results: [] } }
  );

  console.log(filter, "filter");
};

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

const getIDs = async (chunk) => {
  return new Promise((resolve, reject) => {
    let idContainer = [];

    for (let i = 0; i < chunk.length; i++) {
      let objID = chunk[i].product_id;

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
      resolve();
    });
  });
};

const insertBodyIntoProductID = (chunk) => {
  console.log("called insert body");

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
          question_id: { question_id, upsert: true },
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
  return new Promise((resolve, reject) => {
    productIDModel.bulkWrite(BodyContainer).then((data) => {
      console.log(
        data.matchedCount,
        " matched count",
        data.modifiedCount,
        "modified count"
      );
      console.log("first Body of data executed into product_id");
      resolve();
    });
  });
};

const initiateGetIDs = async (chunkArr, chunk_size) => {
  const chunkArrCopy = [...chunkArr];

  let arrChunks = [];

  while (chunkArrCopy.length) {
    console.log("this is one of the chunks in initiate id");
    arrChunks.push(getIDs(chunkArrCopy.splice(0, chunk_size)));
  }

  console.log("returning promise chunks!");
  return arrChunks;
};

const initiateInsertBody = (chunkArr, chunk_size) => {
  const chunkArrCopy = [...chunkArr];

  let arrChunks = [];

  while (chunkArrCopy.length) {
    console.log("this is one of the chunks in initiate Body");
    arrChunks.push(insertBodyIntoProductID(chunkArrCopy.splice(0, chunk_size)));
  }

  console.log("returning promise chunks!");
  return arrChunks;
};

const awaitNextCall = async (
  arrPromiseToWaitForCB,
  originalArr,
  arrIndex,
  chunk_size
) => {
  let chunk = arrPromiseToWaitForCB(originalArr[arrIndex], chunk_size);

  console.log("we got a chunk in await call");
  let promiseChunks = await new Promise((resolve, reject) => {
    Promise.resolve(chunk).then((data) => {
      console.log("we resolved promise chunk");
      resolve(data);
    });
  });

  let resolvedChunks = await new Promise((resolve, reject) => {
    Promise.all(promiseChunks).then(async (data) => {
      console.log("we resolved promise CHUNKS!");
      resolve();
    });
  });

  if (arrIndex === originalArr.length - 1) {
    return;
  }

  arrIndex += 1;

  const promises = await awaitNextCall(
    arrPromiseToWaitForCB,
    originalArr,
    arrIndex,
    chunk_size
  );
};

const resolveAllDataToInjectIntoDb = (promiseArr) => {
  Promise.all(promiseArr).then(async (data) => {
    //this is 4 chunks of 4 arrays containing all 3 mil csv data

    /*
      callBack,  - initiateGetIDs
      the original data(3 mil split up into 4 parts) - [ 800k out of the 3 mil data ]
      the index where you want it to start  - 0 - [ [800k data]( - this arr), [], [],[] ]
      and how many times you want the chunk to be split up even furthur! - 4 times
    */

    awaitNextCall(initiateGetIDs, data, 0, 100000);
    awaitNextCall(initiateInsertBody, data, 0, 200000);
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
