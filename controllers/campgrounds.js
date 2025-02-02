const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res) => {
  try{
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send();

  if (!geoData.body.features.length) {
    req.flash("error", "Invalid location. Please enter a valid location.");
    return res.redirect("/campgrounds/new");
  }

  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;

    console.log("Geometry data:", campground.geometry);

    await campground.save();
    
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (e) {
    console.error("Error creating campground:", e);
    req.flash("error", "Error creating campground");
    res.redirect("/campgrounds/new");
  }
};


module.exports.showCampground = async (req, res) => {
  try {
    // Fetch the campground and populate related data
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author"
        }
      })
      .populate("author");

    // Check if the campground is found
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }

    // Check for missing or incomplete geometry data
    if (!campground.geometry || !campground.geometry.coordinates) {
      console.error('Missing geometry data for campground:', campground);
      // Provide default geometry coordinates if not found
      campground.geometry = {
        type: "Point",
        coordinates: [-97.7431, 30.2672] // Default coordinates
      };
    }

    // Log the geometry data for debugging
    //console.log('geometry data:', campground.geometry);

    // Render the view and pass the campground object to the template
    res.render("campgrounds/show", { campground });
  } catch (e) {
    console.error("Error showing campground:", e);
    req.flash("error", "Error loading campground");
    res.redirect("/campgrounds");
  }
};


  module.exports.renderEditCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  };

  module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;

    // Get geocoding data for the new location
    const geoData = await geocoder.forwardGeocode({
      query: req.body.campground.location,
      limit: 1
  }).send();

    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
        geometry: geoData.body.features[0].geometry
    });
    
    // Handle new images
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    
    // Handle image deletion
    if (req.body.deleteImages && req.body.deleteImages.length) {
        // Remove from cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        // Remove from MongoDB
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } }
        });
    }
    
    await campground.save();
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};



// In campgrounds.js controller
module.exports.index = async (req, res) => {
  let query = {};
  
  if (req.query.search) {
      const searchRegex = new RegExp(escapeRegex(req.query.search), 'gi');
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
          req.flash('error', `No campgrounds found matching '${req.query.search}'`);
          return res.redirect('/campgrounds');
      }
      
      res.render("campgrounds/index", { 
          campgrounds,
          search: req.query.search 
      });
  } catch (e) {
      req.flash('error', 'Something went wrong with the search');
      res.redirect('/campgrounds');
  }
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}




  module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
  };