// controllers/reviews.js
const Review = require('../models/review');
const Campground = require("../models/campground");
const { reviewSchema } = require('../schemas'); // Add this line

module.exports.createReview = async (req, res) => {  
    try {
        // First find the campground
        const campground = await Campground.findById(req.params.id);
        if (!campground) {
            req.flash("error", "Cannot find that campground");
            return res.redirect("/campgrounds");
        }

        // Validate review data using Joi
        const { error } = reviewSchema.validate(req.body);
        if (error) {
            // Get populated campground data for re-rendering
            const populatedCampground = await Campground.findById(req.params.id)
                .populate({
                    path: 'reviews',
                    populate: {
                        path: 'author'
                    }
                })
                .populate('author');

            // Format validation errors
            const errors = {};
            error.details.forEach(err => {
                const fieldName = err.path[err.path.length - 1];
                errors[fieldName] = { message: err.message };
            });

            // Render the page with errors
            return res.render('campgrounds/show', {
                campground: populatedCampground,
                reviewErrors: errors
            });
        }

        // If validation passes, create and save the review
        const review = new Review(req.body.review);
        review.author = req.user._id;
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        req.flash("success", "Created new review!");
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (e) {
        console.error(e);
        req.flash("error", "Error creating review");
        res.redirect(`/campgrounds/${req.params.id}`);
    }
};

module.exports.deleteReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Successfully deleted review!");
        res.redirect(`/campgrounds/${id}`);
    } catch (e) {
        console.error(e);
        req.flash("error", "Error deleting review");
        res.redirect(`/campgrounds/${id}`);
    }
};
