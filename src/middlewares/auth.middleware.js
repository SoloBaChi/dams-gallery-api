const jwt = require("jsonwebtoken");

const ResponseMessage = require("../utils/responseMessage");
const userModel = require("../models/user.model");

const verifyToken = (token) =>
  jwt.verify(token, process.env.AUTHENTICATION_SECRET_KEY);

const protect = async (req, res, next) => {
  const bearer = req.headers.authorization;
  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res
      .status(401)
      .json(new ResponseMessage("error", 401, "Don't have an account"));
  }

  //Get the token
  const token = await bearer.split(" ")[1];
  if (token === "undefined") {
    return res
      .status(401)
      .json(new ResponseMessage("error", 401, "Token does not Exist!"));
  }

  //Decode the Token
  let decodedToken;
  try {
    decodedToken = await verifyToken(token);
  } catch (err) {
    return res
      .status(401)
      .json(new ResponseMessage("error", 401, "unauthorized token"));
  }
  // Invalid Token
  if (!decodedToken) {
    return res
      .status(401)
      .json(new ResponseMessage("error", 401, "Invalid Token!"));
  }

  //Extract the user from the decoded token
  const userId = decodedToken.userId;
  if (!userId) {
    return res
      .status(401)
      .json(new ResponseMessage("error", 401, "Invalid token"));
  }
  const user = await userModel.findOne({ _id: userId });
  if (!user) {
    return res
      .status(401)
      .json("error", "Unauthorized Request..something went wrong");
  }

  req.user = user;
  // pass to the next middleware
  next();
};

module.exports = protect;
