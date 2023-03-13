const User = require("../model/users");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const UserVerification=require("./../model/userVerification")
require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});

//Registering a new user
const registerUser = async (req, res) => {
  console.log(req.body.password);
  let { name, email, contact, password } = req.body;
  name = name.trim();
  email = email.trim();
  contact = contact.trim();
  password = password.trim();

  
  try {  
    const data = await User.findOne({ email }).exec();

    if (data) {
      //when some user already exists with the email
      res.json({
        status: "FAILED",
        message: "User with the Provided email already exists",
      });
    } else {
      //add new user

      //Password Hashing
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(password, salt, async (err, hash) => {
          if (err) throw err;
          else {
            try {
              const user = await new User({
                name: name,
                email: email,
                contact: contact,
                password: hash,
              });

              const result = await user.save();
              console.log(result);
              //when user is registered successfully
              sendVerificationEmail(result,res);
              
            } catch (err) {
              console.log(err);
              //when there is some error while registering
              res.json({
                status: "FAILED",
                message: "An error occurred while registering user",
              });
            }
          }
        })
      );
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: "An error occurred while checking for existing user",
    });
  }
};

// send verification email
const sendVerificationEmail = ({ _id, email }, res) => {
  // url to be used in the email
  const currentUrl = "http://localhost:3000/";
  const uniqueString = uuidv4() + _id;

  // mail options
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link
  <b>expires in 6 hours</b>.</p><p>Press <a href=${
    currentUrl + "user/verify/" + _id + "/" + uniqueString
  }
  >here</a>
   to proceed.</p>`,
  };

  // hash the uniqueString
  const saltRounds = 10;
  bcrypt.hash(uniqueString, saltRounds,async (err, hashedUniqueString) => {
    if (err){
      res.json({
        status: "FAILED",
        message: "An error occurred while hashing email data!",
      });
    }
    else {
      try {
      // set values in userVerification collection
      const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });
      await newVerification.save();
          transporter.sendMail(mailOptions, async (err, info)=>{
            if (err){
              res.json({
                status: "FAILED",
                message: "Please provide a valid email address"+ err,
              });
            }else{
              // console.log("mail info",info);
              res.json({
                success:"User Successfully registered",
                status: "PENDING",
                message: "Verification Email sent ",
              });
            }
          });
      }catch(error){
          console.log(error);
          res.json({
            status: "FAILED",
            message: "Couldn't save verification email data!",
          });
        }
      }
    });
};

module.exports = {
  registerUser,
};
