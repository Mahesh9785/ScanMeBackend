const qrCodesModel=require('./../model/qrCodes');
const multer = require('multer');
const fs = require('fs');
const path=require('path')

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
    cb(null, userId+'_'+ filename);
  }
});

const upload = multer({ storage: storage });


const saveQr = async (req, res) => {
    console.log(req.body);
    let { userId, qrName } = req.body;
    //removing any leading or trailing spaces
    
    try {
      //checking whether any user with the same email exists or not
      const existingRecord = await qrCodesModel.findOne({ userId:userId }).exec();
      console.log("existing record",existingRecord);
      if (existingRecord) {
        existingRecord.qrCodes.push(qrName);
        console.log(existingRecord.qrCodes);
        const savedRecord = await existingRecord.save();
        console.log("saved Record",savedRecord);
        try {
          res.json({
            success: true,
            status: "FOUND",
            message: "Qr Codes updated succesfully",
            result: savedRecord,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({
            status: "FAILED",
            message: "An error occurred adding qr code",
            error: error.message,
          });
        }
      } else {
        //if no existing user exists creating a new user
    
        const newQrCode = new qrCodesModel({
          userId,
          qrCodes:[
            qrName
          ]
        });
  
        const savedQr = await newQrCode.save();
        res.json({
            success:savedQr,
            status: "Done",
            message: "Qr Successfully saved",
          });
        }
    } catch (error) {
      //when there is some error while registering
      res.status(500).json({
        status: "FAILED",
        message: "An error occurred while saving qr",
      });
    }
  };

  //Get profile picture
const sendQr = async (req, res) => {
  console.log(req.body);
  try{
  const userId=req.params.userId;
  const result=await qrCodesModel.findOne({userId:userId});
  console.log("userId",userId);

  if(result){
  const directoryPath = path.join(`./public/Qr_Codes/${userId}`);
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.log('Error getting directory information: ' + err);
      res.status(500).send(err);
    } else {
      const userId = req.params.userId;
      // console.log(userId);

      const userFiles = files.filter(file => file.startsWith(userId));
    
      // console.log("userFiles : "+userFiles)
      // res.setHeader('Content-Type', 'application/json');
      res.json({
        status:'SUCCESS',
        data:result,
        qrCodes:userFiles,
        message:'QR codes exists'
    });
    }
  });
}else{
  //if no record with the provided userid exists
  res.status(500).json({ 
      status:"FAILED",
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

