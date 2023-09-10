const mongoose=require("mongoose")
const { Decimal128 } = require('mongodb');


const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        
    },
    password:{
        type:String,
        requried:true
    },isAdmin: {
        type:Boolean,
        default: false
    },isBlocked:{
        type:Boolean,
        default:false
    },wishlist: [
        {
            product: {
                type: mongoose.Types.ObjectId,
                ref: 'product'
            }
        }
    ],cart: [
        {
            product: {
                type: mongoose.Types.ObjectId,
                ref: 'products'
            },
            quantity: {
                type: Number,
            },
            price: {
                type: Number,
            },
            size:{
                type:String
            },
            color:{
                type:String
            },
            total:{
                type:Number
            }

        }
    ], address: [
        {
            name:{type:String},
            house: { type: String },
            post: { type: Number },
            city: { type: String },
            state: { type: String },
            district: { type: String },
            contact:{type:Number}
            
        }
    ],
    wallet: {

        balance: {
            type: Decimal128,
      default: 0.0
        },
        transactions: [String]

    },
    usedCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }],
    resetPasswordToken:{type:String},
    resetPasswordExpires:Date
})

module.exports=mongoose.model('user',userSchema)