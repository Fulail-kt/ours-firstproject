const mongoose=require("mongoose")

const subcategorySchema=mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    parentcategoty:{
        type:{type:mongoose.Schema.Types.ObjectId,ref:'category'}
    }
})

module.exports=mongoose.model('subcategory',subcategorySchema)