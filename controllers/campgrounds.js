const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
const Joi = require('joi');

// Index Route
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

// Render New Form
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

// Create Campground
module.exports.createCampground = async (req, res) => {
    try {
        if (!req.body.campground || !req.body.campground.location) {
            req.flash("error", "Location is required");
            return res.redirect("/campgrounds/new");
        }

        const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();

        if (!geoData?.body?.features || geoData.body.features.length === 0) {
            req.flash("error", "Invalid location. Please enter a valid location.");
            return res.redirect("/campgrounds/new");
        }

        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.body.features[0].geometry;
        campground.images = req.files ? req.files.map(f => ({ url: f.path, filename: f.filename })) : [];
        campground.author = req.user._id;

        await campground.save();
        req.flash("success", "Successfully made a new campground!");
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (e) {
        console.error("Error creating campground:", e);
        req.flash("error", "Error creating campground");
        res.redirect("/campgrounds/new");
    }
};

// Show Campground
module.exports.showCampground = async (req, res) => {
    try {
        const campground = await Campground.findById(req.params.id)
            .populate({
                path: "reviews",
                populate: { path: "author" }
            })
            .populate("author");

        if (!campground) {
            req.flash("error", "Cannot find that campground!");
            return res.redirect("/campgrounds");
        }

        res.render("campgrounds/show", { campground });
    } catch (e) {
        console.error("Error showing campground:", e);
        req.flash("error", "Error loading campground");
        res.redirect("/campgrounds");
    }
};

module.exports.renderEditCampground = async (req, res) => {
  try {
      const { id } = req.params;
      const campground = await Campground.findById(id);
      if (!campground) {
          req.flash('error', 'Cannot find that campground!');
          return res.redirect('/campgrounds');
      }
      // Pass an empty errors object if there are no errors
      res.render('campgrounds/edit', { campground, errors: {} });
  } catch (err) {
      req.flash('error', 'Cannot find that campground!');
      res.redirect('/campgrounds');
  }
};

const { campgroundSchema } = require("../schemas"); // Import Joi schema

module.exports.updateCampground = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCampground = await Campground.findById(id);

    // Validate if campground exists
    if (!existingCampground) {
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }

    // 🛑 **Joi Validation**
    const { error } = campgroundSchema.validate(req.body, { abortEarly: false });

    if (error) {
      console.log("🔴 Joi Validation Errors:", error.details); // Debugging

      const errors = error.details.reduce((acc, err) => {
        acc[err.context.key] = err.message; // Store messages by field name
        return acc;
      }, {});

      return res.render("campgrounds/edit", {
        campground: { ...existingCampground._doc, ...req.body.campground, _id: id },
        errors, // Pass structured errors to the template
      });
    }

    // Geocoding data
    const geoData = await geocoder.forwardGeocode({
      query: req.body.campground.location,
      limit: 1
    }).send();

    if (!geoData.body.features || !geoData.body.features.length) {
      return res.render("campgrounds/edit", {
        campground: { ...existingCampground._doc, ...req.body.campground, _id: id },
        errors: { location: "Invalid location provided" }
      });
    }

    // Update campground
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
      geometry: geoData.body.features[0].geometry
    }, { new: true });

    // Handle new images
    if (req.files && req.files.length > 0) {
      const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
      campground.images.push(...imgs);
    }

    // Handle image deletion
    if (req.body.deleteImages && req.body.deleteImages.length) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } }
      });
    }

    await campground.save();
    req.flash("success", "Successfully updated campground!");
    return res.redirect(`/campgrounds/${campground._id}`);

  } catch (e) {
    console.error("Error updating campground:", e);
    return res.render("campgrounds/edit", {
      campground: existingCampground,
      errors: { general: "Error updating campground" }
    });
  }
};




// Search Campgrounds
module.exports.index = async (req, res) => {
    let query = {};

    if (req.query.search) {
        const searchRegex = new RegExp(escapeRegex(req.query.search), "gi");
        query = {
            $or: [
                { title: searchRegex },
                { location: searchRegex },
                { description: searchRegex }
            ]
        };
    }

    try {
        const campgrounds = await Campground.find(query);
        if (req.query.search && campgrounds.length === 0) {
            req.flash("error", `No campgrounds found matching '${req.query.search}'`);
            return res.redirect("/campgrounds");
        }

        res.render("campgrounds/index", {
            campgrounds,
            search: req.query.search
        });
    } catch (e) {
        req.flash("error", "Something went wrong with the search");
        res.redirect("/campgrounds");
    }
};

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Delete Campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
};
