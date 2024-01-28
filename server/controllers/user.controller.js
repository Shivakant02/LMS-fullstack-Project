const { use } = require("../app");
const User = require("../models/user.model");
const { default: AppError } = require("../utils/appError");

const cookieOptions = {
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,//7 days
    httpOnly:true
}

const register =async (req,res) => {
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
    if (!use) {
        return next(new AppError('user registration failed please try again.', 400));
    }
    
// TODO: upload user picture

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

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
        success: true,
        message: "User registered successfully",
        user
    })
    
};

const logOut = () => {
    
};

const getProfile = () => {
    
};



module.exports = {
    register,
    logOut,
    login,
    getProfile,

}