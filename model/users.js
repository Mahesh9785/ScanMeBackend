const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let user = new Schema(
  {
    name: {
      type: String,
      required : true
    },
    email: {
      type: String,
      required : true
    },
    contact: {
      type: String,
      required : true
    },
    password: {
      type: String,
      required : true
    },
    verified:{
        type:Boolean,
        default:false
    }
  },
  {
    collection: "users",
  }
);

module.exports = mongoose.model("user", user);
