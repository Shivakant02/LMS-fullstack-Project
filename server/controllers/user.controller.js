import app from "../app.js";
import User from "../models/user.model.js";
import { default as AppError } from "../utils/appError.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import crypto from 'crypto'
import sendEmail from '../utils/sendEmail.js'


const cookieOptions = {
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,//7 days
    httpOnly:true
}


//Register a user
const register =async (req,res,next) => {
    const { fullName, email, password } = req.body;

// if any field is empty
    if (!fullName || !email || !password) {
        return next(new AppError('All the fields are required', 400));
    
    }

    // if user Exists with the same Email address
     const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new AppError('Email already exists.', 400));
    }


    // Create a new user
    const user = await User.create({
        fullName,
        email,
        password,
        awatar: {
            public_id: email,
            secure_url:''
        }
    })


    // if user is not created 
    if (!app.use) {
        return next(new AppError('user registration failed please try again.', 400));
    }
    
    //  upload user picture
    console.log(`File Details->`,JSON.stringify(req.file));
    if (req.file) {
       try {
         const result = await cloudinary.v2.uploader.upload(req.file.path,{
            folder: 'lms',
            width: 250,
            height: 250,
            gravity: 'faces',
            crop:'fill'
        })

        if (result) {
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url = result.secure_url;

            //remove file from local server

            fs.rm(`uploads/${req.file.filename}`)
           }
           
       } catch (error) {
        return next(new AppError(e.message||'file upload failed please try again.', 400));
       }
    }

    await user.save();


    //generate JWT token
    const token = await user.generateJWTToken();
    user.password = undefined;
    res.cookie('token', token, cookieOptions);
    

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user
    })

};


//Login Function
const login = async (req, res,next) => {
    const { email, password } = req.body;


    if (!email || !password) {
        return next(new AppError('Every field is required', 400));
    }

    const user = await User.findOne({ email }).select('+password')
    
    if (!user || (await !user.comparePassword(password))) {
        return next(new AppError('email or password miss match',401))
    }


    // generate JWT Token
    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user
    })
    
};


//Logout function
const logOut = (req,res) => {

    res.cookie('token', null, {
        secure: true,
        maxAge: 0,
        httpOnly:true
})
    
    res.status(200).json({
        success: true,
        message:"User logged out successfully"
    })
};


//to find User profile
const getProfile =async (req,res) => {
    const user = await User.findById(req.user.id)
    
    res.status(200).json({
        success: true,
        message: "user details",
        user
    })
};

//forget Password

const forgetPassword =async (req,res,next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError('Email is required !', 400));
    }

    const user = await User.findOne({ email });


    if (!user) {
        return next(new AppError('Email is not registered', 400));
    }

    const resetToken = await user.generatePasswordToken();
    await user.save();
    

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Reset password';
    const message = `You can reset password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\nIf you have not requested this, kindly ignore.`
    
    console.log(resetPasswordUrl);
    try {
        await sendEmail(email, subject, message);
        
        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully`
        });
        
    } catch (error) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();
        return next(new AppError(error.message, 500));
    }

};

//reset password
const resetPassword =async (req,res,next) => {
    const { resetToken } = req.params;
    const { password } = req.body
    
    const forgetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
    
    
    const user = await User.findOne({
        forgetPasswordToken,
        forgotPasswordExpiry:{$gt:Date.now()}
    })

    if (!user) {
        return next(new AppError('Token is invalid or  expired , please try again', 400));
    }

    user.password = password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined
    
    await user.save()

    res.status(200).json({
        success: true,
        message:'Password changed successfully'
    })
};



export  {
    register,
    logOut,
    login,
    getProfile,
    forgetPassword,
    resetPassword,

}