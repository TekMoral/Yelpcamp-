const multer = require('multer');
const { storage } = require('./cloudinary');
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");


const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit 
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files are allowed'));
        }
        cb(null, true);
    }
});


module.exports.uploadCampgroundImages = (req, res, next) => {
    upload.array('image', 5)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            let errorMsg = 'Error uploading files';
            if (err.code === 'LIMIT_FILE_SIZE') errorMsg = 'File too large. Maximum size is 5MB';
            if (err.code === 'LIMIT_FILE_COUNT') errorMsg = 'Too many files. Maximum is 5';
            if (err.code === 'LIMIT_UNEXPECTED_FILE') errorMsg = 'Only image files are allowed';
            
            req.flash('error', errorMsg);
            return res.redirect('/campgrounds/new');
        } else if (err) {
            req.flash('error', 'Unexpected error uploading files');
            return res.redirect('/campgrounds/new');
        }
        next();
    });
};


module.exports.validateCampground = (req, res, next) => {
    if (!req.body.campground) {
        req.flash('error', 'Invalid campground submission');
        return res.redirect(req.get('Referrer') || '/campgrounds/new');
    }

    const { error } = campgroundSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(el => el.message).join(', ');
        req.flash('error', errorMessages);

        // Redirect back to the correct form for both create & update
        const redirectUrl = req.method === 'POST' 
            ? '/campgrounds/new' 
            : `/campgrounds/${req.params.id}/edit`;

        return res.redirect(req.get('Referrer') || redirectUrl);
    }
    
    next();
};




module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in");
        return res.redirect("/login");
    }
    next();
};

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        
        req.flash('error', msg);  // Flash the error message
        return res.redirect(req.get('Referrer') || `/campgrounds/${req.params.id}`);
    }
    next();
};

