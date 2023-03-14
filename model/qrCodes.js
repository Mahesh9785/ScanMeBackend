const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let qrCodes = new Schema(
  {
    userId: {
      type: String,
      required : true
    },
    qrName: {
      type: String,
      required : true
    },
    qrCode: {
      type: String,
      required : true
    }
  },
  {
    collection: "qrCodes",
  }
);

module.exports = mongoose.model("qrCodes", qrCodes);
