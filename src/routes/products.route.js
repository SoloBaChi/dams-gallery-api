const {
  createProduct,
  getAllProducts,
} = require("../controller/products.controller");
const { body } = require("express-validator");

const router = require("express").Router();

router.post(
  "/upload-product",
  body("title")
    .isString()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage("Product title must be at least 3 characters"),
  body("description")
    .isString()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage("Product Description must be at least 3 characters"),
  body("imgSrc")
    .isString()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage("No source image Provided!"),
  createProduct,
);

// get all products
router.get("/all-products", getAllProducts);

module.exports = router;
