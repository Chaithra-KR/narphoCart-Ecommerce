const mongoose = require("mongoose")
const product = mongoose.Schema({
    product:{
        type:String,
        required:true,
        
    },
    category:{
        type:String,
        ref:"Category",
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    liststatus:{
        type:Boolean,
        default:true
    },
    isDelete:{
        type:Boolean,
        default:false
    },
    reviews:[{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        userReview:{
            type:String
        }
    }]
  
    
})

module.exports=mongoose.model("Product",product)