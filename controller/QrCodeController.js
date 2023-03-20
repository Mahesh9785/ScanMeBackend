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
    cb(null, userId+'_'+ filename);
  }
});

const upload = multer({ storage: storage });

const saveQr = async (req, res) => {
  try {
    const { userId, qrName } = req.body;
    const existingQrCodes = await qrCodesModel.findOne({ userId:userId }).exec();
    
    if (existingQrCodes) {
      console.log(existingQrCodes.qrCodes.includes(qrName))
      if (!existingQrCodes.qrCodes.includes(qrName)) {
        existingQrCodes.qrCodes.push({
          qrCodeName:qrName,
          qrCodeImageName
        });
        const savedQrCodes = await existingQrCodes.save();
        res.json({
          success: true,
          status: "FOUND",
          message: "QR codes updated successfully",
          result: savedQrCodes,
        });
      }else{
        res.json({
          success: false,
          status: "FAILED",
          message: "QR code with the following name already exists",
        });
      }
    } else {
      const newQrCodes = new qrCodesModel({
        userId,
        qrCodes:[
          {
            qrCodeName:qrName,
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



  //Get profile picture
const sendQr = async (req, res) => {
  // console.log(req.body);
  try{
  const userId=req.params.userId;
  const result=await qrCodesModel.findOne({userId:userId});
  // console.log("userId",userId);

  if(result){
  const directoryPath = path.join(`./public/Qr_Codes/${userId}`);
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.log('Error getting directory information: ' + err);
      res.status(500).send(err);
    } else {
      const userId = req.params.userId;   
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
    upload
  };