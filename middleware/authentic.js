const User = require("../models/userModels")
const isLogin = async (req, res, next) => {
    
    const user =await User.findOne({_id:req.session.userid}) 
    try {
        if (req.session.userid) {
            const block = user.access;
            if(block==true){
                
            }else{
                res.redirect("/login")
            }
            next()
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    isLogin
}