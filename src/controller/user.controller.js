const ResponseMessage = require("../utils/responseMessage");

// get the user profile
const me = async (req, res) => {
  try {
    const { name, email, _id: id } = req.user;
    return res.status(200).json(
      new ResponseMessage("success", 200, "Your Profile", {
        name,
        email,
        id,
      }),
    );
  } catch (err) {
    return res
      .status(404)
      .json(new ResponseMessage("error", 404, "Internal Sever Error!"));
  }
};

module.exports = me;
