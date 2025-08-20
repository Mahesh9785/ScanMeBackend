const User = require("../model/users");
const bcrypt = require("bcryptjs");

// Authenticating a user
const verifyUser = async (req, res) => {
  try {
     
      const result = await User.findOne({ email: req.body.email }); //retrieves the document that match the provided email address
      console.log("result"+result)
      
        if(result){        
        let isAuthenticated = false;

        // check if user is verified
        if (!result.verified) {
            res.status(403).json({
            status: "FAILED",
            message: "Email hasn't been verified yet. Check your inbox",
            });
            }else{
        if (await bcrypt.compare(req.body.password, result.password)) { 
            //If a passwords match, isAuthenticated = true
            
            isAuthenticated = true;
            //sends the user data as a JSON response
            res.json({
                status:'SUCCESS',
                data:result,
                message:'user verified successfully Frust'
            });
        }
        
        //If no match is found
        if (!isAuthenticated) {
            res.status(404).json({ 
                status:"FAILED",
                message: "Authentication failed" 
            });
        }
    }
    }else{
        //if no user with the provided email exists
        res.status(401).json({ 
            status:"FAILED",
            message: "No such Email ID exists, If you are a new user please register" 
        });
    }
    } catch (err) {
        console.log(err)
        res.status(500).json({ 
            status:"FAILED",
            message:err
        });
  }
};

module.exports = {
  verifyUser,
};
