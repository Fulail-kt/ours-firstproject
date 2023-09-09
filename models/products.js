const mongoose=require('mongoose')

const productSchema=mongoose.Schema({
    title: String,
  color: String,
  gender: String,
  category:{
    type:String,
    ref:'category'},
  size:[String],
  price:Number,
  stock: Number,
  description:String,
  images:[String],
  deleted:{
    type:Boolean,
    default:false
  }
})


module.exports=mongoose.model('products',productSchema)