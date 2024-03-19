const validationResult = require("express-validator").validationResult,
  bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken"),
  nodemailer = require("nodemailer");

// const sendActivationToken = require("../services/sendActivationEmail");
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

    // hash the user password
    // const hashedPassword  = aw
    // Generate Activation Tokem
    const activationToken = await generateActivationToken();

    // Create a User Without Saving to the database
    const newUser = await userModel.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      activationToken,
    });

    // send the Activation link to the email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const activationLink = `https://www.damsgallery.com/activate/${activationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Activate Your Account",
      html: `
         <h2>welcome ${name}</h2>
        <p>Click <a href="${activationLink}">here</a> to activate your account</p>
        `,
    };
    transporter.sendMail(mailOptions, (error, success) => {
      if (error) {
        console.log(`Error sending Activation Email`, error);
      }
      return res
        .status(200)
        .json(
          new ResponseMessage(
            "success",
            200,
            "Activation link sent to your email",
          ),
        );
    });

    console.log(newUser);
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
    const user = await userModel.findOne({
      activationToken: activation_token,
    });
    if (!user) {
      console.log("user exist");
      return res
        .status(404)
        .json(new ResponseMessage("error", 404, "invalid activation token"));
    }
    // Activate the user and save to the DB
    user.isActive = true;
    user.activationToken = null; //reset the activation token to null
    await user.save();
    console.log("saved");

    // Generate Access token
    const accessToken = await newToken(user);

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
    const accessToken = await newToken(user);

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
