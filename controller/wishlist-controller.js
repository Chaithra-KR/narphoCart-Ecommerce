const User = require("../models/userModels")
const Product = require("../models/product-model");
const mongoose=require('mongoose')


// to get wishlist
const getWishlist = async(req,res)=>{
    try {
        const userId =req.session.userid
        const userSession = userId;
        if(!userId){
            res.redirect("/login")
        }
        const userDatas = await User.findOne({_id:userId})
        const wishData = await User.findOne({_id:userId}).populate('wishlist.product')
        res.render("wishlist-page",{wishData,userSession,userDatas})
    } catch (error) {
        console.log(error);
        res.render('500')
    } 
}


// to post wishlist
const addToWishlist = async (req, res) => {
    try {
      const productId = req.params.id;
      const id =req.session.userid
      if (req.session.userid) {
        let isExist = await User.findOne({_id: id });
        let wishlistIndex = isExist.wishlist.findIndex(
            (productId) => productId.product == req.params.id
        );
        if (wishlistIndex == -1) {
          await User.updateOne(
              { _id: id },
                  { $push: { wishlist: { product: productId}}}
          );
          res.send({added:true});
        } else{
            await User.updateOne(
                { _id: id },
                    { $pull: { wishlist: { product: productId } } }
            )
            res.send({exists:true});
        }
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error);
      res.render('500')
    }
  };
  

//add to wishlist from product detailes
const addToWish = async(req,res)=>{
  try {
    console.log("hai");
    const productId = req.query.id;
      if (req.session.userid) {
        const productData = await Product.findById({ _id: productId });
        const userId = req.session.userid;
        const userDatas = await User.findById({ _id: userId });
  
        const existingCartItem = userDatas.wishlist.find(
          (item) => item.product.toString() === productData._id.toString()
        );
  
          if (existingCartItem) {
            res.json({status:false})
        } else {
          const wishDatas = await User.updateOne(
            { _id: userId },
            { $push: { wishlist: { product: productData._id } }}
            
          )
          res.json({status:true})
        }
      }else{
        res.redirect("/login")
      }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


// to remove wishdata
const  deleteWishdata = async(req,res)=>{
  try {
      const userId =req.session.userid
      if(userId){
        const id = req.params.id;
        const user = await User.findOne({_id:userId})
        const find = user.wishlist.find(async(value)=>{
                if(value.product==id){
                  const values = value._id;
                  await User.updateOne(
                    { _id: userId },
                    { $pull: {'wishlist': { _id:values } } })
                }
        });
        res.json({success:true});
      }else{
        res.redirect("/login")
      }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
  }

module.exports ={
    getWishlist,
    addToWishlist,
    deleteWishdata,
    addToWish
}