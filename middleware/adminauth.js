const isLogin = async (req, res, next) => {
    try {
        if (req.session.adminId) {
            next()
        } else {
            res.redirect("/admin/adminlogin")
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isLogin
}