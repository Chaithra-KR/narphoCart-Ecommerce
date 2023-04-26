const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Product = require("../models/product-model")
const Category = require("../models/category-model")
const Coupon = require("../models/coupon-model")
const Order = require("../models/order-model")



const securePassword = async (password) => {
    console.log("to convert password into bcrypt");
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}


//node mailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,

    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);


//registration page started
const doRegister = async (req, res) => {
    try {
        if (req.session.userid) {
            res.redirect("/")
        } else
            res.render("registration",)
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

//to get privacy notice page
const privacynotice = async(req,res)=>{
    try {
        res.render('privacy-notice')
    } catch (error) {
        console.log(error);
        res.render('500')  
    }
}
//otp page started

const getotp = async (req, res) => {
    try {
        if(req.session.otp){
        res.redirect("/otp")
        console.log("otp page existed");}
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }

}


//otp validation started
const otpValidation = async (req, res) => {
    console.log(" to insert users data")
    try {
            req.session.name = req.body.name,
            req.session.email = req.body.email,
            req.session.mobile = req.body.mobile,
            req.session.dob = req.body.dob
            req.session.password = req.body.password

        
        const checkUser = await User.findOne({ email: req.session.email })
        if (!checkUser) {
           
            console.log("Email is valid. There where no another accounts");

            var mailFormat = {
                from: "narphocart@gmail.com",
                
                to: req.body.email,
                subject: "OTP for registration",
                html: "<h4> OTP for account verification is : " + otp + "</h4>",
            }

           
            
            transporter.sendMail(mailFormat, (error, data) => {
                if (error) {
                    
                    return console.log(error);
                   
                } else {
                    res.render('otp')
                    console.log("success");
                }
            })
          

        } else {
            res.render("registration", { errorMessage: "We are sorry,this email login is already exist. Try another email address to register." })
        }


    } catch (error) {
        console.log(error.message);
        res.render('500')
        console.log("error founded");
    }

}


//otp verification
const verifyOtp = async (req, res) => {
    try {
        if (req.body.otp == otp) {
            const securedPassword = await securePassword(req.session.password,10)
           
            const user = new User({
                name: req.session.name,
                email: req.session.email,
                mobile: req.session.mobile,
                dob: req.session.dob,
                password: securedPassword
            })  

            const userData = await user.save();
             console.log("user Data is successfully saved");
            if (userData) {
                console.log("Your regstration has been successfull");
                res.render("login", { successmessage: "Your regstration has been successfull" })
            } else {
                console.log("your registration has been failed");
                res.render("registration")
            }

        }else{
            res.render("otp",{message:"Incorrect password"})
            console.log(error.message);
        }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}


// home page 
const home = async(req, res) => {
    try {
        const number = 3
        const productDatas = await Product.find({liststatus:true}).populate("category").limit(8)
        const productDataz = await Product.find({liststatus:true}).populate("category").limit(number)
        let userSession = req.session.userid;   
        if(userSession){
            const wishlist = await User.findOne({_id: userSession}).populate('wishlist.product');
            const wishId = wishlist.wishlist.map(wishlistItem => wishlistItem.product); 
            res.render('home', { userSession,productDatas,wishId,productDataz})
        }else{
            res.render('home', { userSession,productDatas,productDataz })
        }
       
    } catch (error) {
        console.log(error)
        // res.render('500')
    }
}


// category filtering
const category =  async(req,res)=>{
    try {
        console.log('data-------------');
            const id = req.body.id
            const userId = req.session.userid
            const category = await Category.findOne({_id:id})
            
            if(userId){
                const productDatas = await Product.find({'category':id,liststatus: true}).populate('category')
                console.log(productDatas,"product data with usersession");
                const categoryData = await Category.find()
                const ids =req.session.userid
                const wishlist = await User.findOne({ _id: ids}).populate('wishlist.product')
                const wishId = wishlist.wishlist.map(wishlistItem => wishlistItem.product);
                res.json({productDatas,categoryData,category,wishId})
            }else{
                const productDatas = await Product.find({'category':id,liststatus: true}).populate('category')
                console.log(productDatas,"product data without usersession");
                const categoryData = await Category.find()
                res.json({productDatas,categoryData,category})
            }
    } catch (error) {
        console.log(error.message)
        res.render('500')
    }
}



//to render the product detailes page
const getproductDetailes = async(req,res)=>{
    try {
        const id = req.query.id;
        console.log('id',id);
        const productDatas = await Product.findById({_id:id})
        .populate("category")
        .populate({ path: "reviews.userId", select: "name" });
let user;
        const reviewsWithUserName = productDatas.reviews.map(review => {
            const { userId, ...rest } = review;
             // Destructure user field from review object
            return {
              user: userId.name, // Get the name of the user using populated data
              ...rest // Include the rest of the review fields
            };
          });
          console.log(user,'reviewuserwiehfwiuerf');
            console.log(productDatas.product,"prodyuhrjf");
            console.log(productDatas.reviews,"prodyuhrjflerksfjlero34deepak");
            let userSession = req.session.userid;
            console.log(userSession);
            const orderData = await Order.find({"user._id":userSession,'products.product':id,status:"Delivered"})
            console.log(orderData,'DELivered');
            const orderLength = orderData.length
            res.render("product-detailes",{userSession,productDatas,orderData})
        
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//review
const productReview = async(req,res)=>{
    try {
        const productReview = req.body.productReview
        const pId = req.body.pid       
        await Product.findByIdAndUpdate(pId,{$push:{reviews:{userId:req.session.userid,userReview:productReview}}}).then((data)=>{
            console.log("success");
            if(data){
                res.redirect('/')

            }
        })

    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

//update review
const updateProductReview = async(req,res)=>{
    try {
        const productReview = req.body.productReview
        const pId = req.body.pid
        const reviewId  = req.body.reviewId
        console.log('hello update review');
        await Product.findOneAndUpdate({_id:pId,'reviews._id':reviewId},{$set:{'reviews.$.userReview':productReview}},{new:true}).then((data)=>{
            if(data){
                res.json({success:true,productReview})
            }else{
                console.log('error');
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

//login page started
const doLogin = async (req, res) => {
    console.log("user login page existed");
    try {
        if (req.session.userid) {
            res.redirect('/')
        } else {
            if (req.session.error) {
                let error = req.session.error   
                req.session.error = null
                res.render("login", { message: error })
            } else {
                res.render('login')
            }
        }
        
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//login verification started
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        console.log(email,"email");
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                if (userData.access) {
                    console.log("home page exist");
                    req.session.userid = userData._id;
                    res.redirect("/");
                } else {
                    req.session.error = 'This website has prevented you from browsing this url. For more information visit the help center.'
                    console.log("Your access is denied");
                    res.redirect("/login")
                }


            } else {
                req.session.error = 'email or password is incorrect'
                console.log("email or password is incorrect");
                res.redirect("/login")
            }
        }
         else {
            req.session.error = 'email or password is incorrect'
            console.log("email or password is incorrect jjjjj");
            res.redirect("/login")
        }

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

// shop page 
const shop = async (req, res) => {
    try {
      let userSession = req.session.userid; 
      const currentPage = req.query.page || 1;
      const perPage = 6;
      const productCount = await Product.count();
      const totalPages = Math.ceil(productCount / perPage);
  
      if (userSession) {
        const productDatas = await Product.find({liststatus: true})
          .populate('category')
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
        const wishlist = await User.findOne({_id: userSession}).populate('wishlist.product');
        const wishId = wishlist.wishlist.map(wishlistItem => wishlistItem.product);
  
        const categoryData = await Category.find();
        res.render('shop', {
          userSession,
          productDatas,
          categoryData,
          currentPage,
          totalPages,
          productCount,
          wishId
        });
      } else {
        const productDatas = await Product.find({liststatus: true})
          .populate('category')
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
  
        const categoryData = await Category.find();
        res.render('shop', {
          userSession,
          productDatas,
          categoryData,
          currentPage,
          totalPages,
          productCount
        });
      }
    } catch (error) {
      console.log(error.message);
      res.render('500')
    }
  };
  

//get User Profile
const getProfile = async(req,res)=>{
    try {
        const id = req.session.userid
        const userDatas = await User.findOne({_id:id})
        let userSession = id
        res.render("user-profile",{userDatas,userSession})
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}


//to post update user profile
const UpdateUserprofile = async(req,res)=>{
    try {
        if(req.session.userid){
            const userSession = req.session.userid
            const name = req.body.name
            const mobile = req.body.mobile
            const editProfile = await User.updateOne({_id:userSession},{$set:{
                name:name ,
                mobile:mobile,
              
            }})
            res.redirect("/userprofile")
        }else{
            res.redirect('/login')
        }
        
    } catch (error) {
        console.log(error);
    }
}


//get address page
const getAddress = async(req,res)=>{
    try {
       const id = req.session.userid;
       let userSession = id
       const userDatas = await User.findOne({_id:id})
       res.render("address-page",{userDatas,userSession})
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//create new address
const createAddress =async(req,res)=>{
    try {
        const id = req.session.userid;
        const userSession = id
        const userDatas = await User.findOne({_id:id})
        res.render("add-address",{userSession,userDatas})
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//post addres page
const putAddress = async(req,res)=>{
    try {
      const id = req.session.userid
      const userData = User.findOne({_id:id})
      const addressDatas = {
         name:req.body.deliveryname,
         phone:req.body.phone,
         houseName : req.body.houseName,
         city : req.body.city,
         pin : req.body.pin,
         distrit : req.body.distrit
      }
     
      await User.updateOne({_id:id},{$push:{address:addressDatas}})
      res.redirect("/address")

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

// for delete address
const deleteAddress = async (req, res) => {

    try {
        const userId =req.session.userid
        const id = req.params.id;
        await User.findOne({ _id: id });
        await User.updateOne(
            { _id: userId },
            { $pull: { address: { _id: id } } }
        ).then(() => {
            res.redirect("/address");
        });
    } catch (error) {
        console.log(error);
        res.render('500')
    }

}
//to get edit address
const getEditaddress = async(req,res)=>{
    try {
        const id = req.query.id;
        const userSession = req.session.userid
        const userDatas = await User.findOne({_id:userSession})
        const addressDatas = userDatas.address.find((values)=>{
            return values._id==id;
        })
        res.render("edit-address",{addressDatas,userSession,userDatas})
    } catch (error) {
        console.log(error);
    }
}

//to edit address
const doEditAddress = async(req,res)=>{
    try {
        const id = req.query.id;
        const user = req.session.userid;
        console.log(user);
        console.log(id);
        const addressData = await User.find({_id:user,"address._id":id},{address:1})
        console.log(addressData,".....");
        addressData.forEach(element => {
            console.log(element.address);
        });
        res.redirect("/address")
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


const singlequantityInc = async(req,res)=>{
    try {

        // const userId = req.session.userid
        let productId = req.body.proId;
        productId = productId.trim()
        const userId = req.body.user;
        let count = req.body.count;
        count = parseInt(count);
        const productData = await Product.findOne({_id:productId})
        if(req.session.userid){
         const Updated =  await User.updateOne({_id:req.session.userid,singlequantity:productId},
          {$inc:{singlequantity:count,singleTotalprice:productData.price*count}},{new:true})
          const user = await User.findOne({_id:req.session.userid})
          const total = user.singleTotalprice;
          res.json({success:true,total})

        }else{
          res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}


//to get wallet
const getWallet = async(req,res)=>{
    try {
        const userSession= req.session.userid
        const userDatas = await User.findOne({_id:userSession})
        console.log(userDatas,"0000000000");
        res.render("wallet",{userSession,userDatas})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}
//to post wallet
const postWallet = async(req,res)=>{
    try {

    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

//to get coupon
const getCoupon = async(req,res)=>{
    try {
        const userSession= req.session.userid
        const userDatas = await User.findOne({_id:userSession})
        const Coupondata = await Coupon.find()
        // let date =new Date()
        //     const notExp = Coupondata.filter((val)=>{
        //         return val.exp>=date
        //     })
        //     const Exp = Coupondata.filter((val=>{
        //         return val.exp<=date
        //     }))
        // await Coupon.findByIdAndUpdate({exp:Exp},{$set:{status:"Expired"}})
        res.render("coupon",{userSession,userDatas,Coupondata})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


const userLogout = async (req, res) => {
    try {
 
        req.session.userid="";
        res.redirect("/")
        console.log("session destroyed & home page exited");
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}
const search = async(req,res)=>{
    try {
        console.log('data-------------');
            const search = (req.query.search) || "";
            let isRender = false;
            if (req.query.isRender) {
                isRender = true
            }
            const searchData = new String(search).trim()
            const query ={
                isDelete:false
            }
            if (search) {
                query["$or"] = [
                    { product: { $regex: ".*" + searchData + ".*", $options: "i" } },
                    { description: { $regex: searchData, $options: "i" } },
                ];
            }
            const id = req.body.id
            const category = await Category.findOne({_id:id})
            if (category) {
                query["$or"] = [
                    { category: category }
                ];
            }
            const product = await Product.find(query).populate('category')
            const userId = req.session.userid
            
            if(userId){
                const productDatas = await Product.find({'category':id}).populate('category')
                console.log(productDatas,"product data with usersession");
                const categoryData = await Category.find()
                const ids =req.session.userid
                const wishlist = await User.findOne({ _id: ids}).populate('wishlist.product')
                const wishId = wishlist.wishlist.map(wishlistItem => wishlistItem.product);
                res.json({productDatas,product,categoryData,category,wishId})
            }else{
                const productDatas = await Product.find({'category':id}).populate('category')
                console.log(productDatas,"product data without usersession");
                const categoryData = await Category.find()
                res.json({productDatas,product,categoryData,category})
            }
    } catch (error) {
        console.log(error.message)
        res.render('500')
    }
}

const priceOrder = async(req,res)=>{
    try {
        console.log("haiii");
        const user = req.session.userid
        const pId = req.body.id
        const cId = req.body.cId

       
        if(user){
            const productDatas = await Product.find({'category':cId}).populate('category').sort({price:-1});
            console.log('product datas--------',productDatas);
            console.log(productDatas,"product data with usersession");
            const categoryData = await Category.find()
            const ids =req.session.userid
            const wishlist = await User.findOne({ _id: user}).populate('wishlist.product')
            const wishId = wishlist.wishlist.map(wishlistItem => wishlistItem.product);
            res.json({productDatas,categoryData,category,wishId})
        }else{
            const productDatas = await Product.find({'category':cId}).populate('category')
            console.log(productDatas,"product data without usersession");
            const categoryData = await Category.find()
            res.json({productDatas,categoryData,category})
        }

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

module.exports = {
    home,
    doRegister,
    otpValidation,
    doLogin,
    verifyLogin,
    getotp,
    userLogout,
    verifyOtp,
    getproductDetailes,
    getProfile,
    getAddress,
    putAddress,
    createAddress,
    deleteAddress,
    singlequantityInc,
    shop,
    UpdateUserprofile,
    category,
    getWallet,
    getCoupon,
    postWallet,
    search,
    priceOrder,
    getEditaddress,
    doEditAddress,
    productReview,
    updateProductReview,
    privacynotice

}
