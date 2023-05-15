const UserVerification = require("../model/userVerification");
const User = require("../model/users");
const bcrypt = require("bcryptjs");
const path=require("path");

// verify email
const verifyEmail = async (req, res) => {
  let { userId, uniqueString } = req.params;
  await UserVerification.find({ userId:userId })
    .then(async (result) => {
      if (result.length > 0) {
        console.log(result[0]);
        const { expiresAt } = result[0];
        console.log(expiresAt);
        const hashedUniqueString = result[0].uniqueString;
        // checking for expired unique string
        if (expiresAt < Date.now()) {
          // record has expired so we delete it
          UserVerification.deleteOne({ userId })
          .then(result => {
            User
            .deleteOne({_id: userId})
            .then(() => {
            let message = "Link has expired. Please sign up again.";
            res.redirect(`/user/verified/error=true&message=${message}`);
            })
            .catch(error => {
            let message = "Clearing user with expired unique string failed";
            res.redirect(`/user/verified/error=true&message=${message}`);
            })
            })
            .catch((error) => {
              console.log(error);
              let message = "An error occurred while clearing expired user verification record";
              res.redirect(`/user/verified/error=true&message=${message}`);
            });
        } else {
            // valid record exists so we validate the user string
            // First compare the hashed unique string
            console.log("uniqueString",uniqueString);
            console.log("hashedUniqueString",hashedUniqueString);
            console.log(await bcrypt.compare(uniqueString, hashedUniqueString));
            if(await bcrypt.compare(uniqueString, hashedUniqueString))
            {
            if (result) {
            // strings match
            await User
            .updateOne({_id: userId},{verified: true})
            .then(() => {
                UserVerification
                .deleteOne({userId})
                .then(() => {
                res.sendFile(path.join(__dirname, "./../views/verified.html"));
                })
                .catch(error => {
                console.log(error);
                let message = "An error occurred while finalizing successful verification.";
                res.redirect(`/user/verified/error=true&message=${message}`);
                })
                })
            .catch(error => {
            console.log(error);
            let message = "An error occurred while updating user record to show verified";
            res.redirect(`/user/verified/error=true&message=${message}`);
            })
            } else {
            // existing record but incorrect verification details passed.
            let message = "Invalid verification details passed. Check your inbox.";
            res.redirect(`/user/verified/error=true&message=${message}`);
            }
            }
            else{
            let message = "An error occurred while comparing unique strings.";
            res.redirect(`/user/verified/error=true&message=${message}`);
            }
        }
      } else {
        // user verification record doesn't exist
        let message =
          "Account record doesn't exist or has been verified already. Please sign up or log in.";
        res.redirect(`/user/verified/error=true&message=${message}`);
      }
    })
    .catch((error) => {
      console.log(error);
      let message =
        "An error occurred while checking for existing user verification record";
      res.redirect(`/user/verified/error=true&message=${message}`);
    });
  };


// verify updated email
const verifyUpdatedEmail = async (req, res) => {
  let email=req.params.email;
  
  console.log(email);
  let { userId, uniqueString } = req.params;
  await UserVerification.find({ userId:userId })
    .then(async (result) => {
      if (result.length > 0) {
        console.log(result[0]);
        const { expiresAt } = result[0];
        console.log(expiresAt);
        const hashedUniqueString = result[0].uniqueString;
        // checking for expired unique string
        if (expiresAt < Date.now()) {
          // record has expired so we delete it
          UserVerification.deleteOne({ userId })
          .then(result => {
            let message = "Link has expired. Please sign up again.";
            res.redirect(`/user/verified/error=true&message=${message}`);
            })
            .catch((error) => {
              console.log(error);
              let message = "An error occurred while clearing expired user verification record";
              res.redirect(`/user/verified/error=true&message=${message}`);
            });
        } else {
            // valid record exists so we validate the user string
            // First compare the hashed unique string
            console.log("uniqueString",uniqueString);
            console.log("hashedUniqueString",hashedUniqueString);
            console.log(await bcrypt.compare(uniqueString, hashedUniqueString));
            if(await bcrypt.compare(uniqueString, hashedUniqueString))
            {
            if (result) {
            // strings match
            await User
            .updateOne({_id: userId},{email: email})
            .then(() => {
                UserVerification
                .deleteOne({userId})
                .then(() => {
                res.sendFile(path.join(__dirname, "./../views/verified.html"));
                })
                .catch(error => {
                console.log(error);
                let message = "An error occurred while finalizing successful verification.";
                res.redirect(`/user/verified/error=true&message=${message}`);
                })
                })
            .catch(error => {
            console.log(error);
            let message = "An error occurred while updating user record to show verified";
            res.redirect(`/user/verified/error=true&message=${message}`);
            })
            } else {
            // existing record but incorrect verification details passed.
            let message = "Invalid verification details passed. Check your inbox.";
            res.redirect(`/user/verified/error=true&message=${message}`);
            }
            }
            else{
            let message = "An error occurred while comparing unique strings.";
            res.redirect(`/user/verified/error=true&message=${message}`);
            }
        }
      } else {
        // user verification record doesn't exist
        let message =
          "Account record doesn't exist or has been verified already. Please sign up or log in.";
        res.redirect(`/user/verified/error=true&message=${message}`);
      }
    })
    .catch((error) => {
      console.log(error);
      let message =
        "An error occurred while checking for existing user verification record";
      res.redirect(`/user/verified/error=true&message=${message}`);
    });
};


module.exports = {
  verifyEmail,
  verifyUpdatedEmail
};
