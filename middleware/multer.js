// const multer = require("multer")
// const path = require("path")
// //multer settings
// const storage = multer.diskStorage({
//     destination:function(req,file,callback) {
//         callback(null,path.join(__dirname,"../public/images"))
//     },
//     filename:function(req,file,callback){
//         const name = Date.now()+"-"+file.originalname;
//         callback(null,name);
//     }
// })
// const upload = multer({storage:storage})

// module.exports = upload

const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

// Multer settings
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, callback) {
    const name = Date.now() + "-" + file.originalname;
    callback(null, name);
  },
});

// Multer upload function
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    // Check if file type is an image
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error("Only image files are allowed!"));
    }
    callback(null, true);
  },
});

// Route handler for image upload
const uploadImage = async (req, res) => {
  try {
    const { buffer } = req.file;
    // Use Sharp module to crop the image
    const croppedImageBuffer = await sharp(buffer)
      .resize({ width: 500, height: 500 })
      .toBuffer();
    // Save the cropped image to the server
    const imageName = Date.now() + "-" + req.file.originalname;
    await sharp(croppedImageBuffer).toFile(
      path.join(__dirname, "../public/images", imageName)
    );
    res.status(200).json({ message: "Image uploaded successfully" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { upload, uploadImage };
