const express = require("express");
const connectDB = require("./config/db");
const users = require("./routes/api/users");
require("dotenv").config();

const app = express();

connectDB();

app.use(express.json({ extended: false }));

app.use("/", users);

const port = process.env.PORT || 8082;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
