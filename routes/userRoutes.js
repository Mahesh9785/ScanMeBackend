const express = require("express");
const userRoute = express();
const User = require("../model/users");
const registerUser = require("../controller/RegistrationController");
const verifyUser = require("../controller/LoginController");
const verifyEmail = require("../controller/VerificationController");
const qrCode = require("../controller/QrCodeController");
const update = require("../controller/UpdateController");
const path=require("path");



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
        success: user,
        status: "USER FOUND",
        message: "User with the provided userId exists",
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

userRoute.get('/getProfile/:userId',update.getProfilePicture);


//verify user email
userRoute.get("/user/verify/:userId/:uniqueString", verifyEmail.verifyEmail);

// Verified page route
userRoute.get("/user/verified", (req, res) => {
    res.sendFile(path.join( __dirname, "./../views/verified.html"));
})

userRoute.post("/save-qr/:userId",qrCode.upload.single('file'),qrCode.saveQr);

userRoute.post("/save-profile-picture/:userId",update.upload.single('image'),(req,res)=>{
  res.json({
    success:req.file,
    status: "UPDATED",
    message: "User updated successfully!",
  });
});

userRoute.get('/getQRCodes/:userId',qrCode.sendQr);

userRoute.post("/update/:userId",update.updateUser);

userRoute.post("/update_password/:userId",update.updatePassword);

module.exports = userRoute;