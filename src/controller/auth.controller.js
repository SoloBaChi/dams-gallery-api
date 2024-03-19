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

    const activationLink = `https://dams-gallery-api.vercel.app/activate/${activationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Activate Your Account",
      html: `
      <body style="padding:0.8rem">
      <p style="font-size:1.2rem;line-height:1.5">
      Hi, you have created a new customer account at <br>
      <a style="text-decoration:none;font-size:1.4rem;font-weight:600;color:#ef5533" href="https://www.damsgallery.com/">DAMSGALLERY</a>
      <br>
      all you have to do is to activate it
      </p>
      <button 
      style="border:none;box-shadow:none;font-size:1.1rem;display:block;width:100%;border-radius:8px;background:#ef5533;cursor:pointer;padding:0">
      <a style="text-decoration:none;color:#fff;border:1px solid red;display:block;padding:0.75rem;border-radius:inherit;" href="${activationLink}">Activate your account</a></button>
      </body>
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

    // get the redirect link
    const redirectLink = `https://www.damsgallery.com/activated-account`;

    // Generate Access token
    const accessToken = await newToken(user);

    // send email for account comfirmation
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Customer Account Confirmation",
      html: `
      <body style="padding:0.8rem">
      <h1 style="font-family:sans-serif;font-weight:600;font-size:1.8rem">Welcome to DamsGallery!</h1>
     <p style="font-size:1.2rem;line-height:1.5">
      You have activated your customer account <br>
      </p>
      <button 
      style="border:none;box-shadow:none;font-size:1.1rem;display:block;width:100%;border-radius:8px;background:#ef5533;cursor:pointer;padding:0">
      <a style="text-decoration:none;color:#fff;border:1px solid red;display:block;padding:0.75rem;border-radius:inherit;" href="https://www.damsgallery.com/">Visit our website</a></button>
      </body>
      `,
    };
    transporter.sendMail(mailOptions, (error, success) => {
      if (error) {
        console.log(`Error sending comfirmation Email`, error);
      }

      return res
        .status(200)
        .json(new ResponseMessage("success", 200, "Confirmation email sent"));
    });

    return res.redirect(redirectLink);

    // return res.status(200).json(
    //   new ResponseMessage("success", 200, "user activated successfully", {
    //     accessToken,
    //   }),
    // );
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

    // check if the user has been activated
    if (!user.isActive) {
      return res
        .status(400)
        .json(
          new ResponseMessage(
            "error",
            400,
            "Verification failed!\n use the link sent to your email and activate your account",
          ),
        );
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
