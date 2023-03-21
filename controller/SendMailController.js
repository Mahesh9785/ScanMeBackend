const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const sendMailWithAttachment = async (req, res) => {
    const userId=req.params.userId;
    console.log(req.body);
  const email = req.body.email;
  const filename = req.body.filename;

  console.log(`Sending email to ${email} with attachment ${filename}`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    },
  });

  const directoryPath = path.join("public", `QR_Codes/${userId}`);
  const filePath = path.join(directoryPath, filename);

  const attachment = {
    filename: filename,
    path: filePath,
  };

  const message = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Project attachment",
    text: "Please find the attached project file",
    attachments: [attachment],
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.error(`Error sending email: ${err}`);
      res.json({
        status: "FAILED",
        message: "Email Not Sent!",
      });
    } else {
      console.log(`Email sent: ${info.response}`);
      res.json({
        success: true,
        status: "SUCCESS",
        message: "Email Sent!",
      });
    }
  });
};

module.exports = {
  sendMailWithAttachment,
};