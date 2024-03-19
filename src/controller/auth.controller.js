const validationResult = require("express-validator").validationResult,
  bcrypt = require("bcryptjs"),
  nodemailer = require("nodemailer"),
  jwt = require("jsonwebtoken");

const sendActivationToken = require("../services/sendActivationEmail");
const generateActivationToken = require("../utils/generateActivationToken");
//   local modules
const ResponseMessage = require("../utils/responseMessage"),
  userModel = require("../models/user.model");

const auth = {};

const newToken = (user) =>
  jwt.sign({ id: user._id }, process.env.AUTHENTICATION_SECRET_KEY);

// Register a user
auth.signUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, errors.array()));
  }

  try {
    const { name, email, password } = req.body;
    // check if the email exist
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "email already exist"));
    }

    // Generate Activation Tokem
    const activationToken = generateActivationToken();

    // Create a User Without Saving to the database
    const newUser = new userModel({
      name,
      email,
      password: bcrypt.hash(password, 10),
      activationToken,
    });

    // send the Activation email
    sendActivationToken(email, activationToken);
    console.log(newUser);

    return res
      .status(200)
      .json(
        new ResponseMessage(
          "success",
          200,
          "Activation link sent to your email",
        ),
      );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new ResponseMessage("error", 500, "Internal Server Error"));
  }
};

// activate user account
auth.activateUser = async (req, res) => {
  const { activation_token } = req.params;
  console.log(activation_token);
  try {
    const existingUser = await userModel.findOne({
      activationToken: activation_token,
    });
    if (!existingUser) {
      console.log("user exist");
      return res
        .status(404)
        .json(new ResponseMessage("error", 404, "invalid activation token"));
    }
    // Activate the user and save to the DB
    existingUser.isActive = true;
    existingUser.activationToken = null; //reset the activation token to null
    await existingUser.save();
    console.log("saved");

    // Generate Access token
    const accessToken = newToken(existingUser);

    return res.status(200).json(
      new ResponseMessage("success", 200, "user activated successfully", {
        accessToken,
      }),
    );
  } catch (err) {
    return res
      .status(500)
      .json(new ResponseMessage("error", 500, "Internal Server Error"));
  }
};

// Login a user
auth.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, errors.array()));
  }
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    // Check if email does not exist
    if (!user) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "Invalid Email!"));
    }
    //Check the if the password is correct
    const isCorrectPassword = bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "Invalid Password!"));
    }

    // Genearate token
    const accessToken = newToken(user);

    return res.status(200).json(
      new ResponseMessage("success", 200, "Login Successfully", {
        accessToken,
      }),
    );
  } catch (err) {
    return res
      .status(500)
      .json(new ResponseMessage("error", 500, "Internal Sever Error"));
  }
};

module.exports = auth;
