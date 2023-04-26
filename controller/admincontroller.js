const Admin = require("../models/adminModel")
const User = require("../models/userModels")
const Category = require("../models/category-model");
const Product = require("../models/product-model")
const Coupon = require("../models/coupon-model")
const Order = require("../models/order-model")
const { render } = require("../routes/userRouter");
const { model, models } = require("mongoose");


// admin's login startted
const doLogin = async (req, res) => {
    console.log("admin login page is existed");
    try {
        if (req.session.adminId) {
            res.redirect("/admin/dashboard")
        } else {
            if (req.session.error) {
                let error = req.session.error;
                req.session.error = null;
                res.render("adminlogin", { message: error })
            } else {
                res.render("adminlogin")
            }
        }


    } catch (error) {
        console.log(error.message);
    }
}

//admin's login verification

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const adminData = await Admin.findOne({ email: email })
        console.log(adminData);
        if (adminData) {
            if (password === adminData.password) {
                req.session.adminId = adminData._id;
                res.redirect("/admin/dashboard")
            } else {
                req.session.error = "email or password is incorrect"
                res.redirect("/admin/adminlogin")
            }
        } else {
            req.session.error = "email or password is incorrect"
            res.redirect("/admin/adminlogin")
        }
    } catch (error) {
        console.log(error.message);
    }
}


const getDashboard = async (req, res) => {
    try {
        let adminSession = req.session.adminId
        if(req.session.adminId){
            const totalDelivery = (await Order.find({ status: "Delivered" })).length
            const totalOrder = (await Order.find()).length
            const totalUsers = (await User.find()).length
            const category = (await Category.find()).length
            const products = (await Product.find()).length
            const sale = await Order.find().count()
            const OrderData = await Order.find()
            const Ordered = await Order.find({status:"ordered"}).count()
            const Delivered = await Order.find({status:"Delivered"}).count()
            const Canceled = await Order.find({status:"cancel"}).count()
            const returnProcessing = await Order.find({status:"Return processing"}).count()
            const Returned = await Order.find({status:"returned"}).count()
            if(Delivered.length!=0){
                const revenue = await Order.aggregate([{
                    $match:{
                        status:"Delivered"
                    }},
                      {$group:{
                        _id:null,
                        subtotal:{$sum:"$totalprice"}
                    }
                }])
            console.log(revenue,"revenue");
            res.render("dashboard", { adminSession ,totalDelivery,totalOrder,totalUsers,
                category,products,sale,Ordered,Delivered,Canceled,
                returnProcessing,Returned,OrderData,revenue})

            }
         
            res.render("dashboard", { adminSession ,totalDelivery,totalOrder,totalUsers,
                                      category,products,sale,Ordered,Delivered,Canceled,
                                      returnProcessing,Returned,OrderData})
        }else{
            res.redirect("/admin/adminlogin")
        }
    } catch (error) {
        console.log(error.message);
    }
}


const getUsermanagement = async (req, res) => {
    try {
        const userDatas = await User.find()
        res.render("user-management", { userDatas })
    } catch (error) {
        console.log(error.message);
    }
}


// to block user

const clickBlock = async (req, res) => {
    try {
        const id = req.params.id;
        const notAccess = await User.updateOne({ _id: id }, { $set: { access: false } })
        if (notAccess) {
            res.redirect("/admin/usermanagement")
        } else {
            console.log(error.message);
        }
    } catch (error) {
        console.log(error.message);
    }
}

//to unblock user

const clickUnblock = async (req, res) => {
    try {
        const id = req.params.id;
        const access = await User.updateOne({ _id: id }, { $set: { access: true } })
        if (access) {
            res.redirect("/admin/usermanagement")
        } else {
            console.log(error.message);
        }
    } catch (error) {
        console.log(error.message);
    }
}

// get category management
const getCategory = async (req, res) => {
    try {
        const categoryDatas = await Category.find()
        console.log(categoryDatas);
        res.render("category-management", { categoryDatas })
    } catch (error) {
        console.log(error.message);
    }
}



const getAddcategory = async (req, res) => {
    try {
        const categoryname = req.body.categoryname
        const description = req.body.description
        res.render("add-category")
    } catch (error) {
        console.log(error.message);
    }
}

const insertCategory = async (req, res) => {
    try {
        const category = new Category({
            categoryname: req.body.categoryname,
            description: req.body.description,

        })
        const checkCategory = await Category.findOne({ categoryname: req.body.categoryname })
        if (checkCategory) {
            res.render("add-category", { errormessage: "Sorry, this category is already exists !" })
        } else {
            const categoryData = await category.save();

            res.redirect("/admin/category")
            console.log("The new category is added successfully");

        }
    } catch (error) {
        console.log(error.message);
    }
}

//get edit product detailes
const getEditcategory = async (req, res) => {
    try {
        const id = req.query.id
        const categoryDatas =await Category.findOne({_id:id})
        console.log(categoryDatas,"here the category datas");
        res.render("edit-category", {categoryDatas })
    } catch (error) {
        console.log(error.message);
    }
}

//post edit product detailes
const doEditcategory = async (req, res) => {
    try {
       
        const id = req.query.id;
        const categoryname = req.body.categoryname;
        const description = req.body.description;
        const categoryDatas = await Category.findOne({ categoryname: req.body.categoryname })
        if (
            categoryDatas) {
            res.render("edit-category", {categoryDatas, errormessage: "Sorry, this category is already exists !" })
        }else{
        const editDetailes = await Category.updateOne({ _id: id },{ $set: {
            description: description,
            categoryname: categoryname
        }})
        res.redirect("/admin/category")
    }
    } catch (error) {
        console.log(error.message);
    }
}

//to delete product
const deleteCategory = async(req,res)=>{
    try {
        const id = req.query.id
        const dropData = await Category.findByIdAndUpdate({_id:id},{$set:{isDelete:true}})
        res.redirect('/admin/category')   
    } catch (error) {
        console.log(error.message);
    }

}

//get product management
const getProduct = async (req, res) => {
    try {
        const productDatas = await Product.find({isDelete:false}).populate("category")
        console.log(productDatas[0], "populated");
        res.render("product-management", { productDatas })
    } catch (error) {
        console.log(error.message);
    }
}

//get add product
const getAddproduct = async (req, res) => {
    try {
        const categoryDatas = await Category.find()
        res.render("add-product", { categoryDatas })
    } catch (error) {
        console.log(error.message);
    }
}


// actual product management
const insertProduct = async (req, res) => {
    try {
        const name = req.body.name;
        const productDetail = await Product.findOne( {name:{$regex:'.*'+name+'.*',$options:'i'}} )
        if (productDetail) {

            if(productDetail.isDelete ){
            
                await Product.findOneAndUpdate({name:name},{$set:{isDelete:false}})
                res.redirect('/admin/productmanagement')
            }else{
                res.redirect('/admin/productmanagement')
            }  
        }else{
           
        let files = []
        const imageUpload = await (function () {
            for (let i = 0; i < req.files.length; i++) {
                files[i] = req.files[i].filename
            }
            return files;
        })()
        console.log(files,"this is image")

        const product = new Product({
            product: req.body.product,
            category:req.body.categoryName,
            image: files,
            description: req.body.description,
            stock: req.body.stock,
            status: req.body.status,
            price: req.body.price
        })

        const checkProduct = await Product.findOne({ product: req.body.product })
        if (checkProduct) {
            res.redirect("/admin/productmanagement")
            console.log("Sorry this product is already exists");
        } else {
            const productData = await product.save();
            res.redirect("/admin/productmanagement")
            console.log("The new product is uploaded successfully");
        }}
    } catch (error) {
        console.log(error.message);
    }
}

// actual product management
// const insertProduct = async (req, res) => {
//     try {
//         const product = new Product({
//             product: req.body.product,
//             category: req.body.categoryName,
//             image: req.file.filename,
//             description: req.body.description,
//             stock: req.body.stock,
//             status: req.body.status,
//             price: req.body.price
//         })

//         const checkProduct = await Product.findOne({ product: req.body.product })
//         if (checkProduct) {
//             res.redirect("/admin/productmanagement")
//             console.log("Sorry this product is already exists");
//         } else {
//             const productData = await product.save();
//             res.redirect("/admin/productmanagement")
//             console.log("The new product is uploaded successfully");
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }

//get edit product detailes
const getEditproduct = async (req, res) => {
    try {
        const id = req.query.id
        const productDatas = await Product.findOne({ _id: id }).populate("category")
        const categoryDatas =await Category.find()
        console.log(productDatas,"productDatas at edit product");
        res.render("edit-product", { productDatas,categoryDatas })
    } catch (error) {
        console.log(error.message);
    }
}

//post edit product detailes
const doEditProduct = async (req, res) => {
    try {
       
        // let files = []
        // const imageUpload = await (function () {
        //     for (let i = 0; i < req.files.length; i++) {
        //         files[i] = req.files[i].filename
        //     }
        //     return files;
        // })()

        const id = req.query.id;
        console.log(id,'idddddddddduuu');
        const product = req.body.product;
        const description = req.body.description;
        // const image = imageUpload;
        const categoryname = req.body.categoryName;
        const category = await Category.findOne({_id:categoryname})
        console.log(category.categoryname,"999");
        const price = req.body.price;
        const status = req.body.status;
        const stock = req.body.stock;
        const editDetailes = await Product.updateOne({ _id: id },{ $set: {
            product: product,
            description: description,
            // image: image,
            category: categoryname,
            price: price,
            status: status,
            stock: stock
        }
        })
        res.redirect("/admin/productmanagement")
    } catch (error) {
        console.log(error.message);
    }
}

//to get product image editing page
const getEditimg = async(req,res)=>{
    try {
        const id = req.query.id
        const productDatas = await Product.findOne({ _id: id }).populate("category")
         res.render("image-edit",{ productDatas})
       
    } catch (error) {
        console.log(error);
    }
}

//to patch product image
const patchImage = async(req,res)=>{
    try {
        // let imageUpload = product.image || [];
        // const newImageIds = req.files.map((file) => file.filename);

        // // Check the number of existing images
        // const existingImagesCount = imageUpload.length;

        // // Maximum number of images allowed
        // const maxImages = 10;

        // // Append or remove the new image IDs based on the number of existing images
        // if (existingImagesCount < maxImages) {
        //     imageUpload = [...imageUpload, ...newImageIds];
        // } else {
        //     // Remove the oldest image and append the new image IDs
        //     imageUpload = [...imageUpload.slice(1), ...newImageIds];
        // }
        const id = req.query.id;
        let files = []
        
        const imageUpload = await (function () {
            for (let i = 0; i < req.files.length; i++) {
                files[i] = req.files[i].filename
            }
            return files;
        })()
        
        const image = imageUpload;
         const productDatas = await Product.findOne({ _id: id }).populate("category")
             const categoryDatas =await Category.find()
        const editDetailes = await Product.updateOne({ _id: id },{ $set: {
            image: image,
        }
    }).then((val)=>{
        res.render("edit-product",{productDatas,categoryDatas})
    } )   
    } catch (error) {
        console.log(error);
    }
}


const clicklist = async (req, res) => {
    try {
        const id = req.params.id;
        const notlisting = await Product.updateOne({ _id: id }, { $set: { liststatus: false } })
        if (notlisting) {
            res.redirect("/admin/productmanagement")
        } else {
            console.log(error.message);
        }
    } catch (error) {
        console.log(error.message);
    }
}

//to unblock user

const clickUnlist = async (req, res) => {
    try {
        const id = req.params.id;
        const listing = await Product.updateOne({ _id: id }, { $set: { liststatus: true } })
        if (listing) {
            res.redirect("/admin/productmanagement")
        } else {
            console.log(error.message);
        }
    } catch (error) {
        console.log(error.message);
    }
}

//to delete product
const deleteProduct = async(req,res)=>{
    try {
        const id = req.params.id;
        console.log("params id: @ deleteproduct ",id);
        const dropData = await Product.findByIdAndUpdate({_id:id},{$set:{isDelete:true}});
        dropData.save().then(() => {
            res.json("success");
          });  
    } catch (error) {
        console.log(error.message);
}

}

//get coupon management
const getCoupon = async(req,res)=>{
    try {
    //   if(req.session.adminId){
        // let id = req.session.adminId;
      const couponDatas = await Coupon.find()
      console.log(couponDatas,"couponn data here");
      res.render("coupon-management",{couponDatas})   
    //   }
    } catch (error) {
        console.log(error);
    }
}

//get add coupon
const getAddcoupon = async(req,res)=>{
    try {
        res.render("add-coupon")
    } catch (error) {
        console.log(error.message);
    }
}
//add coupon
const addCoupon = async(req,res)=>{
    try {
        console.log("hello this is coupon");
        const coupon = new Coupon({
            couponCode:req.body.couponCode,
            amount:req.body.amount,
            minAmount:req.body.minAmount,
            exp:req.body.exp
        })
       console.log("it is here");

       const couponData = coupon.save().then((data)=>{
        res.redirect("/admin/coupon");
        })
    } catch (error) {
        console.log(error.message);
    }
}

//get edit coupon
const getEditcoupon = async(req,res)=>{
    try {
        const id = req.params.id;
        console.log(id,"id here");
        const couponDatas = await Coupon.findOne({_id:id})
        res.render("edit-coupon",{couponDatas})
    } catch (error) {
        console.log(error);
    }
}


// to edit coupon 
const   doEditcoupon = async(req,res)=>{
    try {
        const id =req.params.id
        console.log(id,'herreeeeeeee id');
        const couponCode=req.body.couponCode
        const amount=req.body.amount
        const minAmount=req.body.minAmount
        const exp=req.body.exp 
        const editCoupon = await Coupon.updateOne({_id:id},{$set:{
            couponCode:couponCode ,
            amount:amount,
            minAmount:minAmount,
            exp:exp
        }})
        res.redirect("/admin/coupon")
    } catch (error) {
        console.log(error);
    }
}


//to delete coupon
const deleteCoupon = async(req,res)=>{
    try {
        const id = req.params.id;
        console.log("params id: @ deletecoupon ",id);
        const dropData = await Coupon.findByIdAndUpdate({_id:id},{$set:{isDelete:true}});
        dropData.save().then(() => {
            res.json("success");
          });  
    } catch (error) {
        console.log(error.message);
}
}

//to get the order management
const getOrderpage =async(req,res)=>{
    try {
    
        const orderDatas = await Order.find().sort({date:-1})
        res.render("order-management",{orderDatas})
    } catch (error) {
        console.log(error);
    }
}

//to post order status
const getorderStatus = async(req,res)=>{
    try {
        const orderId =req.body.orderId
        
        const orderstatus = await Order.updateOne({_id:orderId},{$set:{status:"Delivered"}})
        res.json({success:true});
    } catch (error) {
        console.log(error);
    }
}

// to change the status order delivered to return 
const orderReturnSts = async(req,res)=>{
    try {
        const orderId = req.body.orderId
        await Order.updateOne({_id:orderId},{$set:{status:"returned"}})
        res.json({success:true})
    } catch (error) {
        console.log(error);
    }
}

// to get product detailes page from the product management
const getOrderDetailes = async(req,res)=>{
    try {
        const id = req.query.id
        const orderProducts = await Order.findOne({_id:id}).populate('user')
        const orderprod = orderProducts.products
        const orderProduct = orderprod.map(n => n.item)
        const products = await Product.find({_id:{$in:orderProduct}})
        res.render("order-detailes",{orderProducts,products})
    } catch (error) {
        console.log(error);
    }
}

//  to get image edit modal
const newImage = async(req,res)=>{
    try {
        const images = req.files
        const id = req.body.id;
        const newImage = images[0].filename
        await Product.updateOne({ _id: id },{ $push: { image: newImage } });
        const productDatas = await Product.findOne({ _id: id }).populate('category');
        const  category = await Category.find({});
        res.render('image-edit', { productDatas,category});
    } catch (error) {
       console.log(error); 
    }
}

//to get sales report
const getSales = async(req,res)=>{
    try {
    const orderDatas = await Order.find({status:"Delivered"}).sort({date:-1})
     res.render("sales-report",{orderDatas})   
    } catch (error) {
        console.log(error);
    }
}

// to get sales report filtered by date 
const salesFilter = async (req, res) => {
    try {
        const start = new Date(req.body.start);
        const end = new Date(req.body.end);
        end.setDate(end.getDate() + 1); // add one day to end date to include orders on the end date
        const orderData = await Order.find({ status: "Delivered", date: { $gte: start, $lt: end } }).sort({ date: -1 });
        res.json({ orderData });
    } catch (error) {
        console.log(error.message);
    }
}



//to export the sales report as excel
const exportSales = async (req, res) => {
    try {
        const excelJS = require('exceljs')
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report')

        worksheet.columns = [

            { header: "Date", key: "date" },
            { header: "Order ID", key: "id" },
            { header: "Customer", key: "name" },
            { header: "Amount", key: "totalprice" },
            { header: "Payment Method", key: "paymentMethod" },

        ];

        const start = new Date(req.body.start);
        const end = new Date(req.body.end);
        end.setDate(end.getDate() + 1);
        const orderData = await Order.find({ status: "Delivered", date: { $gte: start, $lt: end } }).sort({ date:-1 })

        for (let i = 0; i < orderData.length; i++) {
            worksheet.addRow({
                date: orderData[i].
                date.toLocaleDateString(),
                id: orderData[i]._id,
                name: orderData[i].address.name,
                totalprice: orderData[i].totalprice,
                paymentMethod: orderData[i].paymentMethod,
            });
        }

        res.setHeader(
            "content-Type",
            "application/vnd.openxmlformates-officedocument.spreadsheatml.sheet"
        )

        res.setHeader('Content-Disposition', 'attachment; filename=sales.xlsx')

        return workbook.xlsx.write(res).then(() => {
            console.log("this is 200");
        })


    } catch (error) {
        console.log(error.messege);
    }
}


//to logout dashboard
const adminLogout = async (req, res) => {
    try {
        req.session.adminId="";
        res.redirect("/admin/adminlogin")
        console.log("session destroyed & dashboard page exited");
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {

    doLogin,
    verifyLogin,
    getDashboard,
    getUsermanagement,
    clickBlock,
    clickUnblock,
    adminLogout,
    getCategory,
    getAddcategory,
    insertCategory,
    getProduct,
    getAddproduct,
    insertProduct,
    getEditproduct,
    doEditProduct,
    doEditcategory,
    getEditcategory,
    clicklist,
    clickUnlist,
    deleteProduct,
    deleteCategory,
    getCoupon,
    addCoupon,
    getAddcoupon,
    getEditcoupon,
    doEditcoupon,
    deleteCoupon,
    getOrderpage,
    getorderStatus,
    patchImage,
    getEditimg,
    orderReturnSts,
    getOrderDetailes,
    newImage,
    getSales,
    salesFilter,
    exportSales

}