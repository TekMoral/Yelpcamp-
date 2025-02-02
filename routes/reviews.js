const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn } = require("../middleware");

const Campground = require("../models/campground");
const Review = require("../models/review");
const reviews = require("../controllers/reviews");
 // Changed this line

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");


router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  catchAsync(reviews.deleteReview));

module.exports = router;
