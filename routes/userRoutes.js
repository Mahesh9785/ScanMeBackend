const express = require("express");
const userRoute = express();
const User = require("../model/users");
const registerUser = require("../controller/RegistrationController");
const verifyUser = require("../controller/LoginController");
const verifyEmail = require("../controller/VerificationController");
const qrCode = require("../controller/QrCodeController");
const update = require("../controller/UpdateController");
const sendMail = require("../controller/SendMailController");
const resetPass = require("../controller/ForgotPasswordController")
const path=require("path");
const ejs = require('ejs');

userRoute.set('view engine', 'ejs');

cors = require("cors");  //for handling Cross-Origin Resource Sharing (CORS) issues
userRoute.use(cors());

// Add User
userRoute.post("/register", registerUser.registerUser);

// verify a user
userRoute.post("/login", verifyUser.verifyUser);

userRoute.get("/getuser/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.json({
        success: true,
        data: user,
        status: "USER FOUND Yayyyy!!!",
        message: "User with the provided userId exists Mkjsjdhhjg ugjhdfgjgjf gggdgfj dsgfj ",
      });
    } else {
      res.status(500).json({
        status: "FAILED",
        message: "No such UserId exists",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "FAILED",
      message: "Internal server error",
    });
  }
});

//send user profile picture
userRoute.get('/getProfile/:userId',update.getProfilePicture);

//verify user email
userRoute.get("/user/verify/:userId/:uniqueString", verifyEmail.verifyEmail);

//verify user email
userRoute.get("/user/verifyUpdatedEmail/:userId/:uniqueString/:email", verifyEmail.verifyUpdatedEmail);

// Verified page route
userRoute.get("/user/verified", (req, res) => {
    res.sendFile(path.join( __dirname, "./../views/verified.html"));
})

//save user qrCode
userRoute.post("/save-qr/:userId",qrCode.upload.single('file'),qrCode.saveQr);

//save user profile picture
userRoute.post("/save-profile-picture/:userId",update.upload.single('image'),(req,res)=>{
  res.json({
    success:req.file,
    status: "UPDATED",
    message: "User updated successfully!",
  });
});

//send qr of a particular user
userRoute.get('/getQRCodes/:userId',qrCode.sendQr);

//update user account details
userRoute.post("/update/:userId",update.updateUser);

//update user password
userRoute.post("/update_password/:userId",update.updatePassword);

//update user email
userRoute.post("/update_email",update.sendVerificationEmail);

//verify user email
userRoute.post("/send-mail/:userId", sendMail.sendMailWithAttachment);

//send forgot-password mail
userRoute.post('/forgot-password', resetPass.sendResetPassMail);

//reset password page
userRoute.get('/reset-password', async (req, res) => {
  // check if the token exists in the database and is not expired
  const user = await User.findOne({
    resetPasswordToken: req.query.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    return res.status(400).send('Invalid or expired token');
  }

  // render the reset password form with the token as a hidden input field
  res.render('resetPassword',{ email: req.query.email, token: req.query.token });
});

//resetting the password
userRoute.post('/reset-password-done',update.resetPassword);

//delete a QR
userRoute.post("/delete-qr/:userId", qrCode.updateQr);

module.exports = userRoute;
