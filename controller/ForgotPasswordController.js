const nodemailer = require('nodemailer');
const User = require('../model/users');
require("dotenv").config();

// assuming you have a POST route for the "forgot password" feature
const sendResetPassMail= async (req, res) => {
  const { email } = req.body;

  // check if the email exists in the database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send('User not found');
  }

  // generate a random token for resetting the password
  const token = Math.random().toString(36).substr(2);

  // save the token to the user document in the database
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // create a nodemailer transporter for sending the email
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
  });

  // create the email message
  const message = {
    from: process.env.AUTH_EMAIL, // change to your email
    to: email,
    subject: 'Password Reset',
    text: `You are receiving this email because you (or someone else) has requested a password reset for your account. <br>
    Please click on the following link or paste it into your browser to complete the process: <br>
    <a href=${"http://"+req.headers.host+"/reset-password/"+email+"/"+token}>Reset Password</a>
    <br>If you did not request this, please ignore this email and your password will remain unchanged.\n`
  };

  // send the email
  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Error sending email');
    }

    console.log('Email sent: ' + info.response);
    res.status(200).send('Email sent');
  });

}

module.exports = {
sendResetPassMail
};