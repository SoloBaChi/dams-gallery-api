const validationResult = require("express-validator").validationResult;
const nodemailer = require("nodemailer");
const productModel = require("../models/products.model");
const ResponseMessage = require("../utils/responseMessage");

const products = {};

// Create Product
products.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, errors.array()));
  }
  try {
    //   check if a product with same image url exist
    const { title, description, imgSrc,price } = req.body;
    const existingImageUrl = await productModel.findOne({ imgSrc: imgSrc });
    if (existingImageUrl) {
      return res
        .status(400)
        .json(
          new ResponseMessage("error", 400, "A product with image url exist"),
        );
    }
    const newProduct = await productModel.create({
      title,
      description,
      imgSrc,
      price
    });

    // Send email for the product  added
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_FROM,
      subject: "New Product Added",
      html: `
        <body style="padding:0.8rem">
        <p style="font-size:1.2rem;line-height:1.5">
        Hi, a new Product with title ${title} has been added to<br>
        <a style="text-decoration:none;font-size:1.4rem;font-weight:600;color:#ef5533" href="https://www.damsgallery.com/">DAMSGALLERY</a>
        <br>
         We hope to serve you better!
        </p>
        <button 
        style="border:none;box-shadow:none;font-size:1.1rem;display:block;width:100%;border-radius:8px;background:#ef5533;cursor:pointer;padding:0">
        <a style="text-decoration:none;color:#fff;border:1px solid red;display:block;padding:0.75rem;border-radius:inherit;" href="https://www.damsgallery.com/">check it out on our website</a></button>
        </body>
          `,
    };
    transporter.sendMail(mailOptions, (error, success) => {
      if (error) {
        console.log(`Error adding a product`, error);
      }

      return res
        .status(200)
        .json(
          new ResponseMessage(
            "success",
            200,
            "product upload email sent successfully",
          ),
        );
    });
  } catch (err) {
    return res.status(404).json(new ResponseMessage("Internal Server Error !"));
  }
};

// Get all Products
products.getAllProducts = async (req, res) => {
  const allProducts = await productModel.find({});
  if (allProducts.length === 0) {
    return res
      .status(200)
      .json(
        new ResponseMessage("success", 200, "No Products Found!", allProducts),
      );
  }
  return res
    .status(200)
    .json(
      new ResponseMessage(
        "success",
        200,
        "products fetched successfully",
        allProducts,
      ),
    );
};

module.exports = products;
