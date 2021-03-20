const { db } = require("./mongo");

const { Schema } = db;

const ProductInfo = new Schema({
    product_id: { type: Number, required: true, unique: true }
})

const productIDModel = db.model( 'ProductID', ProductInfo );

module.exports.productIDModel = productIDModel;