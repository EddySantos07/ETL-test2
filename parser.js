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

  let data = [];

  for (let i = 1; i <= 4; i++) {
    // readFile(__dirname + `/testCsvMaker/questions${i}.csv`, "utf8", (err, data) => {
    //   if (err) throw err;
      
    //   console.log(data)
    // });

    csv()
    .fromFile(__dirname + `/testCsvMaker/questions${i}.csv`)
    .then( obj => {
      // console.log(obj)
      data.push(obj);
      console.log(data.length)
    }) 
  }
}

readAllFiles();
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
