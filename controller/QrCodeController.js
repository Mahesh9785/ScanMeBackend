const qrCodesModel=require('./../model/qrCodes');

const saveQr = async (req, res) => {
    console.log(req.body);
    let { userId, qrCode, qrName } = req.body;
    //removing any leading or trailing spaces
    
    try {
      //checking whether any user with the same email exists or not
      const existingRecord = await qrCodesModel.findOne({ userId }).lean().exec();
  
      if (existingRecord) {
        existingRecord.qrCodes.push({
            qrName,
            qrCode
        });

        await existingRecord.save((err,result)=>{
            if(err){
                res.json({
                    status: "FAILED",
                    message: "An error occurred adding qr code",
                  });
            }else{
                res.json({
                  success:result,
                  status: "FOUND",
                  message: "Qr Code with the provided UserId already exists",
                });
            }
        })
        // const qrCode=qrCodes.updateOne({userId},{
        //     $set: { "messages.$[].deliveryStatus": "delivered" }
        // })
      } else {//if no existing user exists creating a new user
  
        //hashing the paasword
  
        const newQrCode = new qrCodesModel({
          userId,
          qrCodes:{
            qrName,
            qrCode,
          }
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
      res.json({
        status: "FAILED",
        message: "An error occurred while saving qr",
      });
    }
  };

  module.exports = {
    saveQr
  };

