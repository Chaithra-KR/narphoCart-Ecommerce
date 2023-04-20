const mongoose =  require("mongoose");
const order=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    date:{
            type:Date,
            default:Date.now
    },
    
    products:[{
        product:{
                 type:String,
                 ref:"Product"
                },
        quantity:{  
                 type:Number
                 },
        price:{
                type:Number
                },
        image:{
                type:String
                }
        }],
    paymentMethod:{
                type:String,               
                },
    paymentStatus:{
                type:String,
                default:'pending'
                 },
    status:String,
    address:{
            name:{
                type:String
            },
            phone:{
                type:Number
            },
            houseName:{
                type:String
            },
            city:{
                type:String 
            },
            pin:{
                type:Number
            },
            distrit:{
                type:String
            }
        },
        totalprice:{
            type:Number,
            default:0
        }
  
    
})
module.exports = mongoose.model("Order",order)