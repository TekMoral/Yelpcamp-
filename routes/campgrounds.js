const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground, uploadCampgroundImages } = require("../middleware");
const Campground = require("../models/campground");

// Index and Create routes
router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(
        isLoggedIn,                     
        uploadCampgroundImages,         
        validateCampground,          
        catchAsync(campgrounds.createCampground)
    );

// New campground form route
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Show, Update, and Delete routes
router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(
        isLoggedIn,                     
        isAuthor,                       
        uploadCampgroundImages,         
        validateCampground,             
        catchAsync(campgrounds.updateCampground)
    )
    .delete(
        isLoggedIn,
        isAuthor,
        catchAsync(campgrounds.deleteCampground)
    );

// Edit form route
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampground));

// Image deletion route
router.delete("/:id/images/:imageId",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const { id, imageId } = req.params;
        await Campground.findByIdAndUpdate(id, { $pull: { images: { _id: imageId } } });
        req.flash('success', 'Successfully deleted image');
        res.redirect(`/campgrounds/${id}`);
    })
);

// Error handler for the router
router.use((err, req, res, next) => {
    console.error(err);
    req.flash('error', err.message);
    res.redirect('/campgrounds');
});

module.exports = router;
