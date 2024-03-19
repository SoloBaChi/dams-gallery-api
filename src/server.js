const express = require("express"),
  cors = require("cors"),
  { connectToDb } = require("./services/db.connection"),
  dotenv = require("dotenv").config({}),
  { json, urlencoded } = require("body-parser"),
  userRouter = require("./routes/user.route"),
  { signUp, activateUser } = require("./controller/auth.controller");

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
//Activate user account
app.post("/register", signUp);
app.get("/activate/:activation_token", activateUser);

// //////////////////
//Other Routes
app.use("/api/v1", userRouter);

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
