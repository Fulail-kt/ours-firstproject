const mongoose=require('mongoose')

const bannerSchema = new mongoose.Schema({

    image:String,

    offer:{
        type:String
    },
    title:{
        type:String
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
})


module.exports= mongoose.model("banner",bannerSchema)