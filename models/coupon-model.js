const mongoose = require("mongoose")
const couponSchema = mongoose.Schema({
    couponCode:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true
    },
    minAmount:{
        type:Number,
        required:true
    },
    exp:{
        type:Date,
        required:true
    },
    isDelete:{
        type:Boolean,
        default:false
    },

})
module.exports = mongoose.model("Coupon",couponSchema)