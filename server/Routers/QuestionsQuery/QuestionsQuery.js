const { productIDModel } = require("../../../NoSQLSchema");

const GetQuestions = async (req, res) => {
  console.log("someone called get questions!");

  let params = req.params;

  let product_id =
    typeof params.product_id !== Number || params.product_id === undefined
      ? [1, 2, 3, 4, 5]
      : req.params;

  let page =
    typeof params.page !== Number || params.page === undefined ? 1 : req.params;

  let count =
    typeof params.count !== Number || params.count === undefined
      ? 5
      : req.params;

  console.log(product_id, page, count);
  // make query here

  if (Array.isArray(product_id)) {
    let product_idCopy = [...product_id];

    let filter = [];

    for (let i = 0; i < product_idCopy.length; i++) {
      let product_id = product_idCopy.splice(0, 1);
      filter.push({ product_id });
    }

    let result = await productIDModel
      .find({ product_id: { $in: filter } })
      .exec();

    console.log("result of query!", result);

    res.send(result);
  }
};

module.exports.GetQuestions = GetQuestions;

// const _GetQuestions = GetQuestions;
// export { _GetQuestions as GetQuestions };
