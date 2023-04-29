const express = require("express");
const userRoute = express();
const path = require("path")   
const userController = require("../controller/userController")
const cartController = require("../controller/cart-controller")
const wishlistController = require("../controller/wishlist-controller")
const authentic = require("../middleware/authentic")
const checkController = require("../controller/checkout-controller")


userRoute.set("views", path.join(__dirname, "views"));
userRoute.set("views", "./views/user");

// register & login 
userRoute.get('/',userController.home)
userRoute.get("/register", userController.doRegister);
userRoute.post("/register", userController.otpValidation)
userRoute.get("/privacy-notice",userController.privacynotice)
userRoute.get("/otp",userController.getotp)
userRoute.post("/otp", userController.verifyOtp)
userRoute.get("/login", userController.doLogin);
userRoute.post("/login", userController.verifyLogin);
userRoute.get("/logout", authentic.isLogin, userController.userLogout)

// shop
userRoute.get("/shop",userController.shop)
userRoute.post("/category",userController.category)
userRoute.get("/search",userController.search)

// product detailes
userRoute.get("/productdetailes",userController.getproductDetailes)
userRoute.post('/product-review', userController.productReview)
userRoute.post('/update-product-review',userController.updateProductReview)

// wishlist
userRoute.get("/wishlist",authentic.isLogin,wishlistController.getWishlist)
userRoute.post("/addwish/:id",authentic.isLogin,wishlistController.addToWishlist)
userRoute.post("/dropWish/:id",authentic.isLogin,wishlistController.deleteWishdata)
userRoute.get("/addToWish",authentic.isLogin,wishlistController.addToWish) //from product detailes

// user
userRoute.get("/userprofile",authentic.isLogin,userController.getProfile)
userRoute.post("/userprofile",authentic.isLogin,userController.UpdateUserprofile)

// user address
userRoute.get("/address",authentic.isLogin,userController.getAddress)
userRoute.get("/createaddress",authentic.isLogin,userController.createAddress)
userRoute.post("/address",authentic.isLogin,userController.putAddress)
userRoute.post("/dropAddress/:id",authentic.isLogin,userController.deleteAddress)
userRoute.get("/editaddress",authentic.isLogin,userController.getEditaddress)
userRoute.post("/editaddress",authentic.isLogin,userController.doEditAddress)

// cart
userRoute.get("/cart",authentic.isLogin,cartController.getCart)
userRoute.get("/addcart",authentic.isLogin,cartController.addCart)
userRoute.post("/qtychange",authentic.isLogin,cartController.quantityInc)
userRoute.post("/Itemdelete/:id",authentic.isLogin,cartController.deleteCart)

// buy now
userRoute.get("/singleCheckout",authentic.isLogin,checkController.getSingleCheckout)
userRoute.post("/singleCheckout",authentic.isLogin,checkController.singleCheckout)

// cart checkout
userRoute.get("/checkOut",authentic.isLogin,checkController.getCheckout)
userRoute.post("/checkOut",authentic.isLogin,checkController.placeOrder)
userRoute.post("/insertAddress",authentic.isLogin,checkController.addAddress)
userRoute.post("/Addressdelete/:id",authentic.isLogin,checkController.deleteAddress)
userRoute.post("/setAddress",authentic.isLogin,checkController.setAddress)
userRoute.post("/verify-razorpay",authentic.isLogin,checkController.verifyRazorpay)

// payment success
userRoute.get("/success",authentic.isLogin,checkController.getSuccess)
userRoute.get("/codsuccess",authentic.isLogin,checkController.getCodsuccess)

// user order
userRoute.get("/orderList",authentic.isLogin,checkController.getOrderlist)
userRoute.get("/orderedProducts",authentic.isLogin,checkController.orderedProducts)
userRoute.post("/cancelOrder",authentic.isLogin,checkController.cancelOrder)
userRoute.post("/returnOrder",authentic.isLogin,checkController.returnOrder)

// wallet
userRoute.get("/wallet",authentic.isLogin,userController.getWallet)

//coupon
userRoute.get("/coupon",authentic.isLogin,userController.getCoupon)
userRoute.post("/applyCoupon",authentic.isLogin,checkController.applyCoupon)

module.exports = userRoute;