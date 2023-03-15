const express = require("express");
const userRoute = express();
const registerUser = require("../controller/RegistrationController");
const verifyUser = require("../controller/LoginController");
const verifyEmail = require("../controller/VerificationController");
const qrCode = require("../controller/QrCodeController");
const path=require("path");



cors = require("cors");  //for handling Cross-Origin Resource Sharing (CORS) issues
userRoute.use(cors());

// Add User
userRoute.post("/register", registerUser.registerUser);

// verify a user
userRoute.post("/login", verifyUser.verifyUser);

//verify user email
userRoute.get("/user/verify/:userId/:uniqueString", verifyEmail.verifyEmail);

// Verified page route
userRoute.get("/user/verified", (req, res) => {
    res.sendFile(path.join( __dirname, "./../views/verified.html"));
})

userRoute.post("/save-qr",qrCode.saveQr);

module.exports = userRoute;
