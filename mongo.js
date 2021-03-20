const mongoose = require("mongoose");

const db = mongoose;

mongoose.connect("mongodb://localhost/testCsv", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

mongoose.connection
  .once("open", () => {
    console.log("Connected to mongodb!");
  })
  .on("error", (err) => {
    console.log(err);
  });

module.exports.db = db;
