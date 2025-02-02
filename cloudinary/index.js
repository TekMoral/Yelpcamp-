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
    allowedFormats: ["jpeg", "png", "jpg", "mp4", "mov", "avi"],
    resource_type: "auto",
    transformation: [
      // Image transformations
      { width: 2000, height: 1500, crop: 'scale', quality: 'auto:best' },
      // Video transformations
      { 
        width: 1280,
        height: 720,
        crop: "scale",
        quality: "auto:best",
        video_codec: "auto",
        format: "mp4"
      }
    ]
  }
});

module.exports = {
  cloudinary,
  storage,
}
