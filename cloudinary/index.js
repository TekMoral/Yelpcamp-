const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "YelpCamp",
    allowedFormats: ["jpeg", "png", "jpg", "mp4", "mov", "webp"],
    resource_type: "auto",
    transformation: [
      { width: 2000, height: 1000, crop: 'fill'},
      {quality: 'auto:best'},
    ]
  }
});

module.exports = {
  cloudinary,
  storage,
}
