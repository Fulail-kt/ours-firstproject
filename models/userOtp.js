const mongoose=require('mongoose')

const otpSchema=mongoose.Schema({
    email:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date,
})

module.exports=mongoose.model('userotp',otpSchema)