const axios = require("axios");
const { oauth2Client } = require("../utils/googleConfig");
const userSchema = require("../models/user.schema");
const { sendtoken } = require("../utils/sendtoken");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");

//testing page
exports.google = catchAsyncErrors(async (req, res, next) => {
    let code = req.query.code;
    let googleRes = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(googleRes.tokens);

    let userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);

    const {email,name,picture} = userRes.data;

    let user = await userSchema.findOne({email});

    if(!user){
        user = await userSchema.create({
            name,
            email,
            avatar:{
                fileId: "",
                url:picture
            }
        })
    }

    sendtoken(user, 200, res);
    // ************************

    // const { _id } = user;
    // const token = jwt.sign({ _id, email },
    //     process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_TIMEOUT,
    // });
    // res.status(200).json({
    //     message: 'success',
    //     token,
    //     user,
    // });
    
});
