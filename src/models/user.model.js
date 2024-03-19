const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    activationToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    cart: [],
  },
  {
    timestamps: true,
    // include virtual properties in the JSON representation of the document.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const userModel = model("user", userSchema);
module.exports = userModel;
