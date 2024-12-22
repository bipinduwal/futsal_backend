const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    }
},{timestamps:true})


module.exports = mongoose.model("User" , userSchema)