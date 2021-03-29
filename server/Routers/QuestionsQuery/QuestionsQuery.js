const { productIDModel } = require("../../../NoSQLSchema");

const GetQuestions = async (req, res) => {
  console.log("someone called get questions!");

  let params = req.params;

  req.params.product_id = Number(req.params.product_id);
  req.params.page = Number(req.params.page);
  req.params.count = Number(req.params.count);

  console.log(typeof req.params.product_id, req.params.page, req.params.count);

  let product_id =
    typeof params.product_id !== "number" || !!params.product_id === false
      ? [1, 2, 3, 4, 5]
      : params.product_id;

  let page =
    typeof params.page !== "number" || !!params.page === false
      ? 1
      : params.page;

  let count =
    typeof params.count !== "number" || !!params.count === false
      ? 5
      : params.count;

  console.log(product_id, page, count);
  // make query here

  if (Array.isArray(product_id)) {
    let product_idCopy = [...product_id];

    let result = await productIDModel
      .find({ product_id: { $in: product_idCopy } })
      .exec();

    // console.log("result of query!", result);

    res.send(result);
  } else {
    let how_many = count * page;

    let result = await productIDModel
      .find({ product_id: { $in: [...Array(how_many + 1).keys()].slice(1) } }) //https://stackoverflow.com/questions/3746725/how-to-create-an-array-containing-1-n
      .exec();

    res.send(result);
  }
};

module.exports.GetQuestions = GetQuestions;
