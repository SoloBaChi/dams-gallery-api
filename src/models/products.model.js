const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imgSrc: {
      type: String,
    },
    // createdBy: {
    //   ref: "user",
    // },
  },
  {
    timestamps: true,
  },
);

const productModel = model("product", productSchema);
module.exports = productModel;
