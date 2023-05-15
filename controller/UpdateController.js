const multer = require('multer');
const User = require("../model/users");
const fs = require('fs');
const bcrypt = require("bcryptjs");
const path = require('path');
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

//to save user profile picture in a folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = `public/Profiles/`;
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const userId = req.params.userId;
      const fileExt = file.mimetype.split('/')[1];
      const filePattern = new RegExp(`^${userId}\.(.+)$`);

      // Check if there is an existing file with the same name but a different extension
      fs.readdir('public/Profiles', (err, files) => {
        if (err) {
          cb(err);
        } else {
          const existingFile = files.find((filename) => filePattern.test(filename));
          if (existingFile) {
            const existingExt = existingFile.match(filePattern)[1];
            if (existingExt !== fileExt) {
              fs.unlink(`public/Profiles/${existingFile}`, (err) => {
                if (err) cb(err);
              });
            }
          }
          cb(null, `${userId}.${fileExt}`); // Rename file with user ID and original extension
        }
      });
    }
  });
  
  const upload = multer({ storage: storage });

  //update user account details
  const updateUser = async (req, res) => {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $set: {name:req.body.name, contact:req.body.contact} },
        { new: true }
      );
      if (!updatedUser) {
        res.status(500).json({
          status: "FAILED",
          message: "User with the provided userId doesn't exist",
        });
      } else {
        console.log(updatedUser);
        res.json({
          success: updatedUser,
          status: "UPDATED",
          message: "User updated successfully!",
        });
        console.log("User updated successfully!");
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "FAILED",
        message: "Internal server error",
      });
    }
  };

  const updatePassword = async (req, res) => {
    try {
      console.log(req.body)
      const updatedUser = await User.findOne(
        { _id: req.params.userId },
      );
      if (!updatedUser) {
        res.status(500).json({
          status: "FAILED",
          message: "User with the provided userId doesn't exist",
        });
      } else {
        if (await bcrypt.compare(req.body.currentPassword, updatedUser.password)) {
          const hash = bcrypt.hashSync(req.body.newPassword, 10);
          updatedUser.password=hash;
          const savedPassword= await updatedUser.save();
          if(savedPassword){
        res.status(200).json({
          success: updatedUser,
          status: "UPDATED",
          message: "User password updated successfully!",
        });
        console.log("User updated successfully!");
      }else{
      res.status(500).json({
        status: "FAILED",
        message: "Internal server error",
      });
      }
    }else{
      res.json({
        status: "FAILED",
        message: "Old password doesn't match",
      });
    }
    }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "FAILED",
        message: "Internal server error",
      });
    }
  };

  const resetPassword = async (req, res) => {
    try {
      console.log(req.body)
      const currentUser = await User.findOne(
        { email: req.body.email },
      );
      if (!currentUser) {
        res.status(500).json({
          status: "FAILED",
          message: "User with the provided userId doesn't exist",
        });
      } else {
          const hash = bcrypt.hashSync(req.body.password, 10);
          currentUser.password=hash;
          const savedPassword= await currentUser.save();
          if(savedPassword){
        res.status(200).json({
          success: savedPassword,
          status: "UPDATED",
          message: "User password updated successfully!",
        });
        console.log("User password updated successfully!");
      }else{
      res.status(500).json({
        status: "FAILED",
        message: "Internal server error",
      });
      }
    }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "FAILED",
        message: "Internal server error",
      });
    }
  };

  //Get profile picture
const getProfilePicture = async (req, res) => {

  const directoryPath = path.join('./public/Profiles');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.log('Error getting directory information: ' + err);
      res.status(500).send(err);
    } else {
      const userId = req.params.userId;
      // console.log(userId);

      const userFiles = files.filter(file => file.startsWith(userId));
      // console.log("userFiles : "+userFiles)
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(userFiles));
    }
  });
};

const sendVerificationEmail = async (req,res)=>{
  console.log("body",req.body);  
  let userId=req.body.userId;
  let email=req.body.email;
  sendEmail({_id:userId,email:email},res);
}

// send verification email
const sendEmail = ({ _id, email }, res) => {
  console.log("userId",_id);
  console.log("email", email);

  // url to be used in the email
  const currentUrl = "http://localhost:3000/";
  const uniqueString = uuidv4() + _id;
  console.log(uniqueString)

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
                        currentUrl + "user/verifyUpdatedEmail/" + _id + "/" + uniqueString + "/" + email
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
      await UserVerification.deleteMany({'userId':_id})
      .then(() => console.log('User verification records deleted'))
      .catch(err => console.error(err));
      const newVerification = new UserVerification({
        userId:_id,
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
            
                res.status(200).json({
                  success: true,
                  status: "SUCCESS",
                  message: "Verification email sent successfully! Please verify to continue",
                });
              }
            });
      }catch(error){
          console.log(error);
          res.status(500).json({
            status: "FAILED",
            message: "Couldn't save new email!",
          });
        }
      }
    });
};

  module.exports = {
    updateUser,
    getProfilePicture,
    updatePassword,
    sendVerificationEmail,
    resetPassword,
    upload
  };