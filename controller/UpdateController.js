const multer = require('multer');
const User = require("../model/users");
const fs = require('fs');
const path = require('path');

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

  const updateUser = async (req, res) => {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $set: req.body },
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

  
  module.exports = {
    updateUser,
    getProfilePicture,
    upload
  };