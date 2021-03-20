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

/* */

/*  STAGE 1 */

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

/*

new 


*/

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
        // const csvWriter = createCsvWriter({
        //   path: `${__dirname}/testCsvMaker/questions${i}.csv`,
        //   header: headers
        // });

        let csvObjChunk = jsonObj.splice(0, eachFractionLength);

        // csvWriter
        //   .writeRecords(csvObjChunk)
        //   .then(() => console.log("The CSV file was written successfully"));

        const ws = fs.createWriteStream(
          `${__dirname}/testCsvMaker/questions${i}.csv`
        );
        fastcsv.write(csvObjChunk, { headers: true }).pipe(ws);
      }
    });
};

makeCsv();

readFile(__dirname + "/QA-CSV-Files/questions.csv", "utf8", (err, data) => {
  if (err) throw err;

  data = data.split("\n");

  const headers = data.slice(0, 1);

  const eachFractionLength = Math.ceil(data.length / 4);

  // , {
  //   headers: true,
  // }

  for (let i = 1; i <= 4; i++) {
    // const ws = fs.createWriteStream(`testCsvMaker/questions${i}.csv`);
    // console.log(data.splice(1, eachFractionLength));
    // let newData =
    /*

    game plan - 

    give the actual file name to csv to json parser

    it will then give us something like this - 
    
     * [
     * 	{a:"1", b:"2", c:"3"},
     * 	{a:"4", b:"5". c:"6"}
     * ]
  

    with that we can convert it back to csv with fast csv and then  repeat the process 4 times 

    each time just slice off a section 

    we then can create child nodes to proccess that info 
    */
    // csv()
    //   .fromFile()
    //   .then((jsonObj) => {
    //     console.log(jsonObj);
    //   });
    // fastcsv.write([...headers, data.splice(1, eachFractionLength)]).pipe(ws);
  }

  // console.log(Math.ceil(data.length / 4));
});

// hold all the pre-documents

// let drainerPlug = 0;

// const drainer = [];

// let questionsRef = questions
//   .pipe(csv({}))
//   .on("data", async (questionsData) => {
//     var csvContents = getCsvContents(myFile);

// let filter = { product_id: questionsData[" product_id"] };
// let update = { product_id: questionsData[" product_id"] };

// drainer.push({
//   updateOne: {
//     filter,
//     update,
//     upsert: true,
//   },
// });

// drainerPlug++;
// // const resume = () => {};
// const writeToDB = () => {
//   // get ready to bulkWrite to the db
//   productIDModel.bulkWrite(drainer);
// };

// const drain = () => {
//   questions.pause();
//   writeToDB();
//   questions.resume();

//   drainerPlug = 0;
// };

// if (drainerPlug === 100000) {
//   drain();
// }

// answers.on('data', ( answersData) => {

// })

// let answersData = await new Promise((resolve, reject) => {
//   answers.pipe(csv()).on("data", (answers) => {
//     resolve(answers);
//   });
// });

// console.log( questionsData ,questionsData[' product_id'])

// const options = { upsert: true, new: true };
// const filter = {
//   product_id: Number(questionsData[" product_id"]),
// };
// const update = {
//   product_id: Number(questionsData[" product_id"]),
// };

// productIDModel
//   .findOneAndUpdate(filter, update, options)
//   .exec()
//   .catch((err) => {
//     console.log(err, "error");
//   });

// console.log("does id exist?", does_id_exist);

// if (!does_id_exist) {
//   const ProductID = new productIDModel({
//     product_id: Number(questionsData[" product_id"]),
//   }).save((err, data) => {
//     if (err) return console.error(err);
//     console.log(data, "succefully saved product id!");
//   });
// }

// console.log("we got data", questionsData);
// })
// .on("end", () => {
// console.log(questions);
// });

// fs.createReadStream("./QA-CSV-Files/questions.csv")
//   .pipe(csv({}))
//   .on("data", (data) => console.log(data))
//   .on("end", () => {
//     // console.log(questions);
//   });

//   , { start: 0, end: 5000 }

// const answersStream = fs.createReadStream("./QA-CSV-Files/answers.csv")
//   .pipe(csv({}))
//   .on("data", (data) => console.log(data))
//   .on("end", () => {
//     // console.log(answers);
//   });

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
