const express = require("express"),
  cors = require("cors"),
  { connectToDb } = require("./services/db.connection"),
  dotenv = require("dotenv").config({}),
  { json, urlencoded } = require("body-parser"),
  userRouter = require("./routes/user.route"),
  { signUp, activateUser, login } = require("./controller/auth.controller"),
  { body } = require("express-validator"),
  protect = require("./middlewares/auth.middleware");

const app = express();

app.use(cors({ origin: "*" }));
app.use(urlencoded({ extended: true }));
app.use(json());

// ROUTES

//////////////////////////////////
//INDEX ROUTE
app.get("/", (req, res) => {
  return res.status(200).json({
    message: `Welcome to damsgallery API`,
    statusCode: 200,
    status: "success",
  });
});

///////////////////////
///Regkister account
app.post(
  "/register",
  body("name")
    .isString()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage("Name must be at least 3 characters"),
  body("email").isEmail().withMessage("please enter a valid email address"),
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
  signUp,
);
app.post(
  "/login",
  body("email").isEmail().withMessage("Please enter a valid email address"),
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
  login,
);

//Activate user account
app.get("/activate/:activation_token", activateUser);

// //////////////////
//Authenticated Routes
// app.use("/api/v1", protect);
app.use("/api/v1/", userRouter);

////////////////////////////////////
//NOT FOUND ROUTE
app.use("*", (req, res) => {
  return res.status(400).json({
    message: "Route not found",
    statusCode: 400,
    status: "error",
  });
});

// Get the port
const port = process.env.PORT || 4001;

// START THE SERVER
const start = async () => {
  // connect to the database
  await connectToDb();
  app.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
};

module.exports = { start };
