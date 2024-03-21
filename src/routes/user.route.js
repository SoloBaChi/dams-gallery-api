const {
  login,
  sendResetPassowrdToken,
  verifyResetPasswordToken,
} = require("../controller/auth.controller");
const { body } = require("express-validator");

const router = require("express").Router();

// router.post("/register", signUp);
// router.post("/activate/:activation_token", activateUser);
// router.post("/login", login);
router.post(
  "/reset-token",
  body("email").isEmail().withMessage("Please enter a valid email address"),
  sendResetPassowrdToken,
);

///////////////////////
//Verify reset Password Token
router.put(
  "/verify-token",
  body("password")
    .isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minSymbols: 1,
      minLowercase: 1,
    })
    .withMessage(
      `Password must be 8 characters and should include numbers,symbols and uppercase`,
    ),
  verifyResetPasswordToken,
);

module.exports = router;
