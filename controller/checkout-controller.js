const User = require("../models/userModels")
const  Product= require("../models/product-model")
const  Order= require("../models/order-model")
const  Coupon= require("../models/coupon-model")
const { log } = require("console")
const { loadavg } = require("os")

const getCheckout = async(req,res)=>{
    try {
        const id = req.session.userid
        const productId = req.query.id
        const userSession = req.session.userid
        const productDatas = await User.findById({_id:productId}).populate("cart.items.products")
        const userDatas = await User.find()
        const addressDatas = await User.findById({_id:id})
        res.render("checkout",{userSession,productDatas,addressDatas,userDatas})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

//get checkout  of single product
const getSingleCheckout = async(req,res)=>{
    try {
        const id = req.session.userid
        const productId = req.query.id
        const userSession = id
        const productDatas = await Product.findById({_id:productId}).populate('category')
        const productData = await Product.find({_id:productId}).populate('category')
        const addressDatas = await User.findById({_id:id})
        .populate('address')
        res.render("singlecheckout",{userSession,productDatas,productData,addressDatas,productId})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

//post checkout of single product
const singleCheckout = async(req,res)=>{
    try {
        const userId = req.session.userid
        const selectedProduct = req.body.idd;
        const productDatas = await User.findOne({_id:userId})
        const productData = await Product.findById({_id:selectedProduct}).populate('category')
        const Total =productData.price
        const quantity = productDatas.singlequantity

        const customerName=req.body.deliveryname;
        const customerPhone=req.body.phone;
        const customerHouse=req.body.houseName;
        const customerPin=req.body.pin;
        const customerCity=req.body.city;
        const customerDistrict=req.body.distrit;
      

        const address = {
            name: customerName,
            phone: customerPhone,
            houseName: customerHouse,
            city: customerCity,
            pin:customerPin,
            distrit: customerDistrict
          }
       
          const products={
  
            product:productData.product,
            quantity:quantity,
            price:Total, 
            image:productData.image[0],   
        }


          let status = req.body.payment==='COD'?'pending':'placed'

    const order = new Order({
      user: userId,
      products:products,
      totalprice: Total,
      address: address,
      paymentMethod:req.body.payment,
      paymentStatus:status,
      status:'ordered'

    })
    const orderData = await order.save()


if (req.body.payment === 'COD')  {
      
  
     let COD =req.body.payment
      res.json({success:true,COD})



    } 
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}
const placeOrder = async(req,res)=>{
    try {
        const userId = req.session.userid
        const productDatas = await User.findOne({_id:userId}).populate("cart.items.products")
        const cartTotal =productDatas.cart.totalprice
        const cartDiscount =productDatas.cart.discount
        if(productDatas.wallet){
        const cartDiscount = productDatas.wallet;
        }
        const orderSubTotal = cartTotal-cartDiscount;

        const customerName=req.body.deliveryname;
        const customerPhone=req.body.phone;
        const customerHouse=req.body.houseName;
        const customerPin=req.body.pin;
        const customerCity=req.body.city;
        const customerDistrict=req.body.distrit;

        const address = {
            name: customerName,
            phone: customerPhone,
            houseName: customerHouse,
            city: customerCity,
            pin:customerPin,
            distrit: customerDistrict
          }
       
    


          let status = req.body.payment==='COD'?'pending':'placed'

    const order = new Order({
      user: userId,
     
      totalprice: orderSubTotal,
      address: address,
      paymentMethod:req.body.payment,
      paymentStatus:status,
      status:'ordered'

    })
    const orderData = await order.save()


    const orderProducts = await Order.findOne({user:req.session.userid}).sort({date:-1}) 
    const id = orderProducts._id;
    productDatas.cart.items.forEach(async(element,i) => {
      const products={
  
          product:productDatas.cart.items[i].products.product,
          quantity:productDatas.cart.items[i].quantity,
          price:productDatas.cart.items[i].price, 
          image:productDatas.cart.items[i].products.image[0],   
               }

       console.log(productDatas.cart.items[i].products.product,'-data-----------');
       await Order.findOneAndUpdate({_id:id},{$push:{products}})
    });


if (req.body.payment === 'COD')  {
      
     
      for (let i = 0; i < productDatas.length; i++) {
        singleProduct = await Product.findById({ _id: productDatas[i].productId })
        singleProduct.stock -= productDatas.product[i].quantity
        singleProduct.save()
      }

      cartData = await User.findByIdAndUpdate({ _id:userId},{$unset:{cart:{$exists:true}}})

      productDatas.product = []
      productDatas.totalprice = 0
      await productDatas.save()

     let COD =req.body.payment
      res.json({success:true,COD})



    } else if (req.body.payment === 'razorpay') {


        const Razorpay = require('razorpay')
        var instance = new Razorpay({ key_id: 'rzp_test_D20tCRgl2HzlWA', key_secret: process.env.RAZORPAY_KEY })
        instance.orders.create({
        amount: orderSubTotal*100,  
        currency: "INR",
        receipt: ""+orderData._id
      },(err,order)=>{
        if (err) {
            console.log(err);
        }else{
           res.json(order) 
        }
      })

    }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

//post addres page
const addAddress = async(req,res)=>{
    try {
      const id = req.session.userid
      const userData = User.findOne({_id:id})
      const addressDatas = {
         name:req.body.deliveryname1,
         phone:req.body.phone1,
         houseName : req.body.houseName1,
         city : req.body.city1,
         pin : req.body.pin1,
         distrit : req.body.distrit
      }
     
      await User.updateOne({_id:id},{$push:{address:addressDatas}})
      .then(() => {
        res.redirect("/checkOut");
        });
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}


const applyCoupon = async(req,res)=>{
    try {
        const id =req.session.userid
        const total =parseInt(req.body.total)
        const coupon = await Coupon.findOne({ couponCode:req.body.code })
        if(coupon){
            const couponexp =coupon.exp.toLocaleString()
            console.log(couponexp,"expiry date");
            const nowdate =new Date().toLocaleString()
            console.log(nowdate,"today date");  
            if(couponexp<=nowdate){
                if (coupon && coupon.minAmount <= total) {

                    const amount = coupon.amount
                    const cartTotal = total - amount
                    await User.updateOne({_id:id},{$set:{"cart.discount":amount}})
                    res.json({ status: true, total: cartTotal, amount ,message:"coupon applied"})
        
                }else{
                    res.json({status:false,message:"Coupon Not Available for this Total Amount"})
                } 
            }else{

                res.json({errormessage:true,message:"Coupon Expired"})

            }
        }else {
            res.json({ errormessage: false, message: 'Invalid coupon' })

        }

    } catch (error) {
      console.log(error);
      res.render('500')
    }
  }


const setAddress = async(req,res)=>{
    try {
        const addressId=req.body.id
        const userId = req.session.userid
        // const payment =  req.body.payment
        const cartData = await User.findById({_id:userId})
        const cartDatas = await User.findOne({_id:userId}).populate('cart.items.products')
        console.log(cartDatas,"data is here");
        
        for (let i = 0; i < cartData.address.length; i++) {
            if (cartData.address[i]._id==addressId) {
                const name =  cartData.address[i].name
                const phone =  cartData.address[i].phone
                const houseName =  cartData.address[i].houseName
                const city =  cartData.address[i].city
                const pin =  cartData.address[i].pin
                const distrit =  cartData.address[i].distrit
                
              
                    res.json({name,phone,houseName,city,pin,distrit})
                
            }
            }


    } catch (error) {
     console.log(error);
     res.render('500')   
    }
}

//to get order list
const getOrderlist =async(req,res)=>{
    try {
        console.log('hiii');
        const userSession = req.session.userid
        const userDatas = await User.findOne({_id:userSession})
        const orderDatas = await Order.find({user:userSession}).sort({date:-1})
        res.render("order-list",{userSession,userDatas,orderDatas})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

//to cancel the order
const cancelOrder = async(req,res)=>{   
    try {
        const orderId =req.body.orderId
        const userid = req.session.userid
        const user = await User.findOne({_id:userid})
        const orderData = await Order.findOne({_id: orderId})
        const value=orderData.totalprice+user.wallet
        if(orderData.paymentMethod=="razorpay"){
            await Order.findOneAndUpdate({_id:orderId},{$set:{status:"cancel"}})
            const wallet = await User.findOneAndUpdate({_id:userid},{$set:{wallet:value}}).then(()=>{
                res.json({success:true})
            })
        }else{
        await Order.updateOne({_id:orderId},{$set:{status:"cancel"}})
        res.json({success:true})

        }

    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

//to retuen order
const returnOrder = async(req,res)=>{
    try {
        const orderId = req.body.orderId
        await Order.updateOne({_id:orderId},{$set:{status:"Return processing"}})
        res.json({success:true})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

//razorpay
const verifyRazorpay = async(req,res)=>{
   try {
    let userId = req.session.userid
    const Crypto = require('crypto')
    
        const razorpay_payment_id= req.body.response.razorpay_payment_id
        const razorpay_order_id= req.body.response.razorpay_order_id
        const razorpay_signature=  req.body.response.razorpay_signature

      let key_secret = process.env.RAZORPAY_KEY

      const hmac_sha256 = (data,secret)=>{
        return Crypto
        .createHmac("sha256",secret)
        .update(data)
        .digest("hex");
      };
     let generated_signature = hmac_sha256(razorpay_order_id + "|" + razorpay_payment_id, key_secret);

  if (generated_signature == razorpay_signature) {
    cartData = await User.findByIdAndUpdate({ _id:userId},{$unset:{cart:{$exists:true}}})
      res.json({success:true});
  }


   } catch (error) {
    console.log(error);
    res.render('500')
   }
}

// to get the product detailes od ordered products
const  orderedProducts = async(req,res)=>{
    try {
        console.log('--------------coming------');
        const id = req.query.id
        const userSession= req.session.userid
        const userDatas = await User.findOne({_id:userSession})
        const productData = await Order.findOne({_id:id}).populate('user')
        console.log('---datas----',productData.status);
           
        res.render("orderlist-detailes",{productData,userSession,userDatas})

      
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}
//to get order sucess page
const getSuccess =async(req,res)=>{
    try {
        if(req.session.userid){
            const userSession = req.session.userid
            res.render("order-placed",{userSession})
        }else{
            res.redirect("/logout")
        }
           
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


//to get cod  order sucess page
const getCodsuccess = async(req,res)=>{
    try {
        if(req.session.userid){
            const userSession = req.session.userid
            res.render("cod-success",{userSession})
        }else{
            res.redirect("/logout")
        }
          
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const deleteAddress = async (req, res) => {
    try {
        const userId =req.session.userid
        const id = req.params.id;
        await User.findOne({ _id: id });
        await User.updateOne(
            { _id: userId },
            { $pull: { address: { _id: id } } }
        )
          
        res.json({ success: true })
        
    
  } catch (error) {
      console.log(error);
      res.render('500')
  }
  
  }
module.exports ={
    getCheckout,
    addAddress,
    getSingleCheckout,
    singleCheckout,
    placeOrder,
    setAddress,
    getSuccess,
    applyCoupon,
    getOrderlist,
    cancelOrder,
    returnOrder,
    verifyRazorpay,
    orderedProducts,
    getCodsuccess,
    deleteAddress

}