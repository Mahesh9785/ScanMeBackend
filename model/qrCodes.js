const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let qrCodes = new Schema(
  {
    userId: {
      type: String,
      required : true
    },
    qrCodes:[    
      {
    qrCodeName:{
      type: String,
      required : true
    },
    qrCodeImageName:{
      type: String,
      required : true
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      required : true
    },
      }
    ]
},
  {
    collection: "qrCodes",
  }
);

module.exports = mongoose.model("qrCodes", qrCodes);
