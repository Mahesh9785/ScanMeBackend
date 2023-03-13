const express = require("express");
const http = require("http");

const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const cors = require("cors");
bodyParser = require("body-parser");

const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(cors());

const server = http.createServer(app);


// Mongo DB conncetion
const database = process.env.MONGO_URI;
mongoose
  .connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Database sucessfully connected"))
  .catch((err) => console.log("Database error: " + err));

//routes path
app.use("/", require("./routes/userRoutes"));

// PORT
const port = process.env.PORT || 3000;

//Listen to a specific port
server.listen(port, () => {
  console.log("Listening on port " + port);
});
