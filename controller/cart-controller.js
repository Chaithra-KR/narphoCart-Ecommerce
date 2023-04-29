const User = require("../models/userModels")
const Product = require("../models/product-model");
const { findById } = require("../models/adminModel");


//to get cart
const getCart = async(req,res)=>{
    try {
        const userSession =req.session.userid
        if(userSession){
          const accessUserdata = await User.findById(userSession).populate('cart.items.products')
          res.render("cart-management",{accessUserdata,userSession})
        }else{
          res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }   
}   


//to add the products to the cart
const addCart = async (req, res) => {
    try {
      const productId = req.query.id;
      if (req.session.userid) {
        const productData = await Product.findById({ _id: productId });
        const userId = req.session.userid;
        const userDatas = await User.findById({ _id: userId });
  
        const existingCartItem = userDatas.cart.items.find(
          (item) => item.products.toString() === productData._id.toString()
        );
          if (existingCartItem) {
            res.json({status:false})// Product already exists in cart
        } else {
          const cartDatas = await User.updateOne(
            { _id: userId },
            { $push: { "cart.items": { products: productData._id, quantity: 1,price:productData.price } } ,$inc:{"cart.totalprice":productData.price}}
            
          )
          res.json({status:true})
        }
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error.message);
      res.render('500')
    }
  };
  

//to manage the quantity change
const quantityInc = async(req,res)=>{
    try {
        let productId = req.body.proId;
        productId = productId.trim()
        const userId = req.body.user;
        let count = req.body.count;
        count = parseInt(count);
        const productData = await Product.findOne({_id:productId})
        if(req.session.userid){
         const cartUpdated =  await User.updateOne({_id:req.session.userid,"cart.items.products":productId},
          {$inc:{"cart.items.$.quantity":count,"cart.totalprice":productData.price*count}},{new:true})
          const user = await User.findOne({_id:req.session.userid})
          const total = user.cart.totalprice;
          const update = await User.findOne(
            {_id: req.session.userid, "cart.items.products": productId},
            {"cart.items.$": 1}
          );
          const cartItem = update.cart.items[0]
          const quantity= cartItem.quantity
          res.json({success:true,total,quantity,productData})
        }else{
          res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}


//to delete products from the cart
const deleteCart = async (req, res) => {
  try {
    const userId =req.session.userid
    const id = req.params.id;
    if(userId){
      const find = await User.findOne({_id:userId}).populate('cart.items.products')
      const item = find.cart.items.find((value) => value._id==id);
      const total =find.cart.totalprice- item.quantity*item.price
      const updateProduct = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { "cart.totalprice":total } },
        { new: true }
      );
      const deleteProduct = await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { "cart.items": { _id: id }, }},{new:true})  
          res.json({ success: true })
    }else{
      res.redirect("/login")
    }
  } catch (error) {
      console.log(error);
      res.render('500')
  }

}


module.exports={
    getCart,
    addCart,
    quantityInc,
    deleteCart
}