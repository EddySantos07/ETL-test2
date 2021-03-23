const { db } = require("./mongo");

const { Schema } = db;

const ProductInfo = new Schema({
  product_id: { type: Number, required: true, unique: true },
  results: [
    {
      question_id: Number,
      question_body: String,
      question_date: String,
      asker_name: String,
      question_helpfulnes: String,
      reported: Boolean,
      answers: {
        Number: {
          answer_id: Number,
          body: String,
          date: String,
          answerer_name: String,
          helpfulness: Number,
          photos: [],
        },
      },
    },
  ],
});

const productIDModel = db.model("ProductID", ProductInfo);

module.exports.productIDModel = productIDModel;
