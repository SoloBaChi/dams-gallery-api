const mongoose = require("mongoose");

const connectToDb = async (req, res) => {
  const url = process.env.DATA_BASE_URL;
  try {
    const params = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    const con = await mongoose.connect(url, params);
    console.log(`connected successfully to ${con.connection.host} database`);
  } catch (err) {
    console.log(`could not connect to the database`, err);
  }
};

module.exports = { connectToDb };
