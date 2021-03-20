const fs = require("fs");

const answers = fs.createReadStream("./QA-CSV-Files/answers.csv")

  module.exports.answers = answers;