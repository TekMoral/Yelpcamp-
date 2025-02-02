const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds")
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const  { isLoggedIn, isAuthor, validateCampground }  = require("../middleware");  // Changed this line
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router.route("/")
.get(catchAsync(campgrounds.index))
.post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));





// New campground form route
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Show single campground route
router.get("/:id", catchAsync(campgrounds.showCampground));

// Edit campground form route
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampground));

// Update campground route
router.put("/:id", isLoggedIn, isAuthor, upload.array('image'), validateCampground, 
  catchAsync(campgrounds.updateCampground));

// Delete campground route
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
