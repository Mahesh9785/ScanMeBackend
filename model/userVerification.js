const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userVerification = new Schema(
  {
    userId: {
      type: String,
      required : true
    },
    uniqueString: {
      type: String,
      required : true
    },
    createdAt: {
      type: Date,
      required : true
    },
    expiresAt: {
      type: Date,
      required : true
    }
  },
  {
    collection: "userVerification",
  }
);

module.exports = mongoose.model("userVerification", userVerification);
