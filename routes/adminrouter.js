const express=require("express")
const adminRoute=express()
const adminController=require("../controller/admincontroller")
const adminAuth=require("../middleware/adminauth")
// const upload = require("../middleware/multer")
const { upload, uploadImage } = require("../middleware/multer");
const { isLogin } = require("../middleware/authentic")


adminRoute.set("views","./views/admin");

// admin login & logout
adminRoute.get("/adminlogin",adminController.doLogin)
adminRoute.post("/adminlogin",adminController.verifyLogin)
adminRoute.get("/adminlogout",adminController.adminLogout)

// dashboard
adminRoute.get("/dashboard" ,adminAuth.isLogin,adminController.getDashboard)

// user management
adminRoute.get("/usermanagement",adminAuth.isLogin,adminController.getUsermanagement)
adminRoute.post("/block/:id" ,adminAuth.isLogin,adminController.clickBlock)
adminRoute.post("/unblock/:id" ,adminAuth.isLogin,adminController.clickUnblock)

// category management
adminRoute.get("/category" ,adminAuth.isLogin,adminController.getCategory)
adminRoute.get("/addcategory",adminAuth.isLogin,adminController.getAddcategory)
adminRoute.post("/category",adminAuth.isLogin,adminController.insertCategory)
adminRoute.get("/editcategory",adminAuth.isLogin,adminController.getEditcategory)
adminRoute.post("/editcategory",adminAuth.isLogin,adminController.doEditcategory)
adminRoute.get("/dropCategory",adminAuth.isLogin,adminController.deleteCategory)

// product management
adminRoute.get("/productmanagement",adminAuth.isLogin,adminController.getProduct)
adminRoute.get("/addproduct",adminAuth.isLogin,adminController.getAddproduct)
adminRoute.post("/productmanagement",upload.array("image",6),adminController.insertProduct)
adminRoute.post("/dropProduct/:id",adminAuth.isLogin,adminController.deleteProduct)
adminRoute.get("/editproduct",upload.array("image",6),adminAuth.isLogin,adminController.getEditproduct)
adminRoute.post("/editproduct",upload.array("image",6),adminAuth.isLogin,adminController.doEditProduct)
// adminRoute.post("/editImage",upload.array("image",6),adminAuth.isLogin,adminController.newImage)
adminRoute.get("/editImage",upload.array("image",6),adminAuth.isLogin,adminController.getEditimg)
adminRoute.post("/editImage",upload.array("image",6),adminAuth.isLogin,adminController.patchImage)
adminRoute.post("/list/:id",adminAuth.isLogin,adminController.clicklist) //product listing
adminRoute.post("/unlist/:id",adminAuth.isLogin,adminController.clickUnlist) //product unlisting

//coupon management
adminRoute.get("/coupon",adminAuth.isLogin,adminController.getCoupon)
adminRoute.get("/addcoupon",adminAuth.isLogin,adminController.getAddcoupon)
adminRoute.post("/applyCoupon",adminAuth.isLogin,adminController.addCoupon)
adminRoute.get("/editCoupon/:id",adminAuth.isLogin,adminController.getEditcoupon)
adminRoute.post("/editCoupon/:id",adminAuth.isLogin,adminController.doEditcoupon)
adminRoute.post("/dropCoupon/:id",adminAuth.isLogin,adminController.deleteCoupon)

//order management
adminRoute.post("/orderStatus",adminAuth.isLogin,adminController.getorderStatus)
adminRoute.get("/order",adminAuth.isLogin,adminController.getOrderpage)
adminRoute.post("/orderReturnSts",adminAuth.isLogin,adminController.orderReturnSts)
adminRoute.get("/orderDetailes",adminAuth.isLogin,adminController.getOrderDetailes)

//sales management
adminRoute.get("/sales",adminAuth.isLogin,adminController.getSales)
adminRoute.post('/salesFilter',adminAuth.isLogin,adminController.salesFilter)
adminRoute.post('/export',adminAuth.isLogin,adminController.exportSales)




    


module.exports=adminRoute