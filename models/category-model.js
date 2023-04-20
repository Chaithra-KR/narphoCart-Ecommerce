const mongoose=require("mongoose")
const category=new mongoose.Schema({

    categoryname:{
        type:String,
        required:true,
        // lowercase:true   
    },
    description:{
        type:String,
        required:true
    },
    isDelete:{
        type:Boolean,
        default:true
    }

})

module.exports=mongoose.model("Category",category)