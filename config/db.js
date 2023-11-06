const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB_URI)
  .then((res) => console.log("Mongoose connected"))
  .catch((err) => console.log(err));