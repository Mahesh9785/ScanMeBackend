const qrCodesModel=require('./../model/qrCodes');
const multer = require('multer');
const fs = require('fs');
const path=require('path')

let qrCodeImageName='';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.params.userId;
    const uploadPath = `public/QR_Codes/${userId}/`;

    // create the directory if it does not exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const userId = req.params.userId;

    console.log(file.originalname);
    const filename = file.originalname.replace(/:/g, '-');
    qrCodeImageName=userId+'_'+ filename;
    // cb(null, userId+'_'+ filename);
    const fileExt = file.mimetype.split('/')[1];
    const filePattern = new RegExp(`^${userId}_\\w+\\.(.+)$`);

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
          cb(null, userId+'_'+ filename);
 // Rename file with user ID and original extension
        }
      });
  }
});

const upload = multer({ storage: storage });

const saveQr = async (req, res) => {
  try {
    const { userId, qrName, qrData } = req.body;
    const existingQrCodes = await qrCodesModel.findOne({ userId:userId }).exec();

    console.log(existingQrCodes)
    
    if (existingQrCodes) {
      let flag='';
      for(let qr in existingQrCodes.qrCodes){
        if(existingQrCodes.qrCodes[qr].qrCodeName==qrName){
          flag=true;
        }
      }
      if (!flag) {
        existingQrCodes.qrCodes.push({
          qrCodeName:qrName,
          qrCodeData:qrData,
          qrCodeImageName,
        });
        const savedQrCodes = await existingQrCodes.save();
        res.json({
          success: true,
          status: "FOUND",
          message: "QR codes updated successfully",
          result: savedQrCodes,
        });
      }else{
        const updateResult=await qrCodesModel.updateOne(
          { userId: userId, 'qrCodes': { $elemMatch: { 'qrCodeName': qrName } } },
          { $set: { 'qrCodes.$.qrCodeData': qrData, 'qrCodes.$.createdAt':Date.now() } });
          
            if (!updateResult) {
              // handle error
              res.status(500).json({
                status: "FAILED",
                message: "An error occurred while updating QR code",
                error: err.message,
              });
            }else{
              // result contains the updated document
              res.json({
                success: true,
                status: "UPDATED",
                message: "QR code with the following name updated",
              });
            }
          }
      
    } else {
      const newQrCodes = new qrCodesModel({
        userId,
        qrCodes:[
          {
            qrCodeName:qrName,
            qrCodeData:qrData,
            qrCodeImageName
          }
        ],
      });

      const savedQrCodes = await newQrCodes.save();
      res.json({
        success: true,
        status: "Done",
        message: "QR code successfully saved",
        result: savedQrCodes,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "FAILED",
      message: "An error occurred while saving QR code",
      error: error.message,
    });
  }
};

const updateQr = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { imageName, qrName } = req.body;

    const filePath = `./public/QR_Codes/${userId}/${imageName}`;

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    
      console.log('File has been deleted successfully!');
    });

    const existingQrCodes = await qrCodesModel.findOne({ userId }).exec();

    console.log(existingQrCodes);

    if (existingQrCodes) {
      let flag = false;
      for (let qr of existingQrCodes.qrCodes) {
        if (qr.qrCodeName === qrName) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        res.json({
          success: false,
          status: " NOT FOUND",
          message: "No Such QrCode Exists",
        });
      } else {
        const filter = { userId: userId };
        const update = { $pull: { qrCodes: { qrCodeName: qrName } } };
        const options = { new: true };

        const updatedDocument = await qrCodesModel.findOneAndUpdate(filter, update, options).exec();
        console.log("updatedDocument", updatedDocument);
        

        if (!updatedDocument) {
          // handle error
          res.status(500).json({
            status: "FAILED",
            message: "An error occurred while updating QR code",
            error: error.message,
          });
        } else {
          // updateResult contains the updated document
          console.log("updateResult", updatedDocument);
          res.json({
            success: true,
            status: "DELETED",
            message: "QR code with the following name Deleted",
          });
        }
      }
    } else {
      res.json({
        success: false,
        status: "NOT FOUND",
        message: "No QrCode Wth the provided User Id Exists",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "FAILED",
      message: "An error occurred while saving QR code",
      error: error.message,
    });
  }
};


  //Get profile picture
const sendQr = async (req, res) => {
  // console.log(req.body);
  try{
  const userId=req.params.userId;
  const result=await qrCodesModel.findOne({userId:userId});
  // console.log("userId",userId);

  if(result){
  const directoryPath = path.join(`./public/QR_Codes/${userId}`);
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.log('Error getting directory information: ' + err);
      res.status(500).send(err);
    } else {
      res.status(200).json({
        status:true,
        data:result,
        message:'QR codes exists'
    });
    }
  });
}else{
  //if no record with the provided userid exists
  res.status(204).json({ 
      status:"NO CONTENT",
      message: "No such user ID exists" 
  });
}
  }catch (error) {
    console.error(error);
    res.status(500).json({
      status: "FAILED",
      message: "An error occurred while saving qr",
      error: error.message,
    });
  }
};


  module.exports = {
    saveQr,
    sendQr,
    updateQr,
    upload
  };