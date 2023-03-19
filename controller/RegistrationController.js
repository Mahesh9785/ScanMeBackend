const User = require("../model/users");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const UserVerification=require("./../model/userVerification")
require("dotenv").config();

//providing services for sending email
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

//verifying whether the provided services for mail are working or not
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
  let { name, email, contact, password } = req.body;
  //removing any leading or trailing spaces
  name = name.trim();
  email = email.trim();
  contact = contact.trim();
  password = password.trim();

  try {
    //checking whether any user with the same email exists or not
    const existingUser = await User.findOne({ email }).lean().exec();

    if (existingUser) {
      res.status(500).json({
        status: "FAILED",
        message: "User with the provided email already exists",
      });
    } else {//if no existing user exists creating a new user

      //hashing the paasword
      const hash = bcrypt.hashSync(password, 10);

      const user = new User({
        name,
        email,
        contact,
        password: hash,
      });

      const savedUser = await user.save();

      //sending verification email
      sendVerificationEmail(savedUser, res);
    }
  } catch (error) {
    //when there is some error while registering
    res.status(500).json({
      status: "FAILED",
      message: "An error occurred while registering user",
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
    html: `<head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
      * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    
    h2 {
      margin-top: 0;
    }
    
    a:hover {
      background-color: #0062cc;
    }
  </style>    
    </head>
    <body style="background-color: #f2f2f2;">
      <table cellpadding="0" cellspacing="0" width="100%" align="center" style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);">
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                  <img src="https://qrcgcustomers.s3.eu-west-1.amazonaws.com/account24451765/qrcodes/61794865.png?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYMOAQO23FRHUYI4Q%2F20230314%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20230314T073947Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=e39c0d4f55afebf1dd1d9ef460c8f2668d2cd3ed2d3749c181cfcf0d08d9ad77" alt="Logo" style="display: block; width:200px; max-width: 100%; height: auto; margin: 0 auto;">
                </td>
              </tr>
              <tr>
                <td style="padding: 20px;">
                  <h2 style="margin-top: 0;">Verify your email address</h2>
                  <p style="margin-bottom: 20px;">This link<b> expires in 6 hours</b>.</p>
                  <p style="margin-bottom: 20px;">Thank you for signing up! To get started, please verify your email address by clicking the button below:</p>
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                      <a href=${
                        currentUrl + "user/verify/" + _id + "/" + uniqueString
                      } style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; border-radius: 5px; text-decoration: none;">Verify Email</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin-top: 20px;">If you didn't sign up for this account, please ignore this email.</p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 20px; background-color: #007bff; color: #fff; border-radius: 0 0 10px 10px;">
                  <p style="margin: 0;">&copy; 2023 ScanMe</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>`,
  };

  // hash the uniqueString
  const saltRounds = 10;
  bcrypt.hash(uniqueString, saltRounds,async (err, hashedUniqueString) => {
    if (err){
      res.status(500).json({
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
              res.status(500).json({
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
          res.status(500).json({
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
