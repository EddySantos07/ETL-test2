const fs = require("fs");

const limit =  {start: 0, end: 975};

const questions = fs.createReadStream("./QA-CSV-Files/questions.csv")
    


module.exports.questions = questions