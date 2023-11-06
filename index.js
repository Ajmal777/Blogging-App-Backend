require("dotenv").config();
const express = require("express");
const cors = require('cors');
// File imports
const db = require("./config/db");
const userRoutes = require("./routes/User");
const blogRoutes = require("./routes/Blog");
const followRoutes = require("./routes/Follow");
const { cleanUpBin } = require("./utils/cron");

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

// routes
app.use("/user", userRoutes);
app.use("/blog", blogRoutes);
app.use("/follow", followRoutes);

app.listen(PORT, () => {
  console.log("Server started at port:", PORT);
  cleanUpBin();
});
