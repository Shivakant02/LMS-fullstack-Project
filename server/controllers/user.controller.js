import app from "../app.js";
import User from "../models/user.model.js";
import { default as AppError } from "../utils/appError.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'


const cookieOptions = {
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,//7 days
    httpOnly:true
}

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

            // fs.rm(`uploads/${req.file.filename}`)
           }
           
       } catch (error) {
        return next(new AppError(e.message||'file upload failed please try again.', 400));
       }
    }

    await user.save();

    

    res.status(200).json({
        success: true,
        message: 'User registration successfully',
        user
    })

};

const login = async (req, res) => {
    const { email, password } = req.body;


    if (!email || !password) {
        return next(new AppError('Every field is required', 400));
    }

    const user = await User.findOne({ email }).select('password')
    
    if (!user || !user.comparePassword(password)) {
        return next(new AppError('email of password miss match'))
    }

    const token = await User. genenateJWTToken();
    user.password = undefined;

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user
    })
    
};

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

const getProfile = (req,res) => {
    const user = User.findById(req.user.id)
    
    res.status(200).json({
        success: true,
        message: "user details",
        user
    })
};



export  {
    register,
    logOut,
    login,
    getProfile

}