import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'

import jwt from 'jsonwebtoken'





const userSchema = new Schema({
    
    fullName: {
        type: String,
        required: [true, "Name is required"],
        minLenght: [4, "Name must be atleast 4 character"],
        maxLenght: [20, "Name must be less than 20 characters"],
        lowercase: true,
        trim:true
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        lowercase: true,
        trim:true
    },
    password: {
        type: String,
        required: [true, "Password required!"],
        minLenght: [8, "Password must contains  atleast 8 characters"],
        select:false
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default:'USER',
    },
    avatar: {
        public_id: {
            type:String,
        },
        secure_url: {
            type:String,
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry:Date

}, {
    timestamps:true
})

userSchema.pre('save',async function () {
    if (!this.isModified('password')) {
        return next();
    }

    this.password=await jwt.hash(this.password,10)

})

userSchema.methods = {
    comparePassword: async function (plainTextPassword) {
        return await bcrypt.compare(plainTextPassword, this.password);
    },
    genenateJWTToken: function () {
        return jwt.sign({
            id: this._id,
            role: this.role,
            email: this.email,
            subscription: this.subscription
        },
            process.env.JWT_SECRET,
            {
                expiresIn:process.env.JWT_EXPIRY
            }
        )
    }
    }



const User = model('User', userSchema);

export default User;