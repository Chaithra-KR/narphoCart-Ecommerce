const User = require("../models/userModels")
const  Product= require("../models/product-model")
const  Order= require("../models/order-model")
const  Coupon= require("../models/coupon-model")
const { log } = require("console")
const { loadavg } = require("os")


//to render checkout page
const getCheckout = async(req,res)=>{
    try {
        const userSession = req.session.userid
        if(userSession){
            const productDatas = await User.findById(userSession).populate("cart.items.products")
            const userDatas = await User.find()
            const addressDatas = await User.findById({_id:userSession})
            res.render("checkout",{userSession,productDatas,addressDatas,userDatas})
        }else{
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


//to get checkout of buy now
const getSingleCheckout = async(req,res)=>{
    try {
        const userSession = req.session.userid
        if(userSession){
            const productId = req.query.id
            const productDatas = await Product.findById({_id:productId}).populate('category')
            const productData = await Product.find({_id:productId}).populate('category')
            const addressDatas = await User.findById({_id:userSession})
            .populate('address')
            res.render("singlecheckout",{userSession,productDatas,productData,addressDatas,productId})
        }else{
            res.redirect("/login")
        }    
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


//to place order from checkout of buy now
const singleCheckout = async(req,res)=>{
    try {
        req.session.order = 'order'
        const userId = req.session.userid
        if(userId){
            const selectedProduct = req.body.idd;
            const productDatas = await User.findOne({_id:userId})
            const productData = await Product.findById({_id:selectedProduct}).populate('category')
            const Total =productData.price
            const quantity = productDatas.singlequantity
    
            //address from body
            const customerName=req.body.deliveryname;
            const customerPhone=req.body.phone;
            const customerHouse=req.body.houseName;
            const customerPin=req.body.pin;
            const customerCity=req.body.city;
            const customerDistrict=req.body.distrit;
          
            //address
            const address = {
                name: customerName,
                phone: customerPhone,
                houseName: customerHouse,
                city: customerCity,
                pin:customerPin,
                distrit: customerDistrict
              }
    
           //product
            const products={
                product:productData.product,
                quantity:quantity,
                price:Total, 
                image:productData.image[0],   
              }
    
                let status = req.body.payment==='COD'?'pending':'placed'
    
                //datas storing to the order collection
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
    
                //COD method
                if (req.body.payment === 'COD')  {
                    let COD =req.body.payment
                    res.json({success:true,COD})
                }
        }else{
            res.redirect("/login")
        } 
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


//to place order from checkout of cart
const placeOrder = async(req,res)=>{
    try {
        req.session.order = 'order'
        const userId = req.session.userid
        if(userId){
            const productDatas = await User.findOne({_id:userId}).populate("cart.items.products")
            const cartTotal =productDatas.cart.totalprice
            const cartDiscount =productDatas.cart.discount
            const orderSubTotal = cartTotal-cartDiscount;

            //address from body
            const customerName=req.body.deliveryname;
            const customerPhone=req.body.phone;
            const customerHouse=req.body.houseName;
            const customerPin=req.body.pin;
            const customerCity=req.body.city;
            const customerDistrict=req.body.distrit;
    
            //address
            const address = {
                name: customerName,
                phone: customerPhone,
                houseName: customerHouse,
                city: customerCity,
                pin:customerPin,
                distrit: customerDistrict
              }

            let status = req.body.payment==='COD'?'pending':'placed'
          
                //order collection
                const order = new Order({
                user: userId,
                totalprice: orderSubTotal,
                address: address,
                paymentMethod:req.body.payment,
                paymentStatus:status,
                status:'ordered'
                })
                const orderData = await order.save()
            // }
    
            const orderProducts = await Order.findOne({user:req.session.userid}).sort({date:-1}) 
            const id = orderProducts._id;
            productDatas.cart.items.forEach(async(element,i) => {

                //products
                const products={
                    product:productDatas.cart.items[i].products.product,
                    quantity:productDatas.cart.items[i].quantity,
                    price:productDatas.cart.items[i].price, 
                    image:productDatas.cart.items[i].products.image[0],   
                    }
            
                await Order.findOneAndUpdate({_id:id},{$push:{products}})
            });
        
            //payment methods
            if (req.body.payment === 'COD'){
                    for (let i = 0; i < productDatas.length; i++) {
                        singleProduct = await Product.findById({ _id: productDatas[i].productId })
                        singleProduct.stock -= productDatas.product[i].quantity
                        singleProduct.save()
                    }
                    const cartData = await User.findByIdAndUpdate({ _id:userId},{$unset:{cart:{$exists:true}}})
                
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
            }else if (req.body.payment === 'wallet') {
                    const walletData = productDatas.wallet-productDatas.cart.totalprice;
                    const updateWallet = await User.updateOne({_id:userId},{$set:{wallet:walletData}})
                    const cartData = await User.findByIdAndUpdate({ _id:userId},{$unset:{cart:{$exists:true}}})
                    let wallet =req.body.payment
                    res.json({success:true,wallet})
            }
        }else{
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


//to post addres 
const addAddress = async(req,res)=>{
    try {
      const user = req.session.userid
      if(user){
        const userData = User.findOne({_id:user})
        const addressDatas = {
           name:req.body.deliveryname1,
           phone:req.body.phone1,
           houseName : req.body.houseName1,
           city : req.body.city1,
           pin : req.body.pin1,
           distrit : req.body.distrit
        }
        await User.updateOne({_id:user},{$push:{address:addressDatas}})
        .then(() => {
          res.redirect("/checkOut");
          });
      }else{
        res.redirect('/login')
      }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}


//to apply the coupon
const applyCoupon = async(req,res)=>{
    try {
        const user =req.session.userid
        if(user){
            const total =parseInt(req.body.total)
            const coupon = await Coupon.findOne({ couponCode:req.body.code })
            if(coupon){
                const couponexp =coupon.exp.toLocaleString()
                const nowdate =new Date().toLocaleString()
                if(couponexp<=nowdate){
                    if (coupon && coupon.minAmount <= total) {
                        const amount = coupon.amount
                        const cartTotal = total - amount
                        await User.updateOne({_id:user},{$set:{"cart.discount":amount}})
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
        }else{
            res.redirect('/login')
        }
    } catch (error) {
      console.log(error);
      res.render('500')
    }
  }


//post address at checkout
const setAddress = async(req,res)=>{
    try {
        const userId = req.session.userid
        if(userId){
            const addressId=req.body.id
            const cartData = await User.findById({_id:userId})
            const cartDatas = await User.findOne({_id:userId}).populate('cart.items.products')
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
        }else{
            res.redirect("/login")
        }
    } catch (error) {
     console.log(error);
     res.render('500')   
    }
}


//to get order list
const getOrderlist =async(req,res)=>{
    try {
        const userSession = req.session.userid
        if(userSession){
            const userDatas = await User.findOne({_id:userSession})
            const orderDatas = await Order.find({user:userSession}).sort({date:-1})
            res.render("order-list",{userSession,userDatas,orderDatas})
        }else{
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


//to cancel the order
const cancelOrder = async(req,res)=>{   
    try {
        const userid = req.session.userid
        if(userid){
            const orderId =req.body.orderId
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
        }else{
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


//to return order
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
    const userId = req.session.userid
    if(userId){
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
    }
   } catch (error) {
    console.log(error);
    res.render('500')
   }
}


// to get the product details of ordered products
const  orderedProducts = async(req,res)=>{
    try {
        const userSession= req.session.userid
        if(userSession){
            const id = req.query.id
            const userDatas = await User.findOne({_id:userSession})
            const productData = await Order.findOne({_id:id}).populate('user')     
            res.render("orderlist-detailes",{productData,userSession,userDatas})
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


//to get order sucess page of online payment
const getSuccess =async(req,res)=>{
    try {
        if(req.session.order == 'order' ){
            req.session.order = ""
            const userSession = req.session.userid
            res.render("order-placed",{userSession})
        }else{
            res.redirect("/")
        }    
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


//to get cod order sucess page
const getCodsuccess = async(req,res)=>{
    try {
        if(req.session.order == 'order' ){
            req.session.order = ""
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


//to drop adress
const deleteAddress = async (req, res) => {
    try {
        const userId =req.session.userid
        if(userId){
            const id = req.params.id;
            await User.findOne({ _id: id });
            await User.updateOne(
                { _id: userId },
                { $pull: { address: { _id: id } } }
            ) 
            res.json({ success: true })
        }else{
            res.redirect("/login")
        }
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