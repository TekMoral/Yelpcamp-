if(process.env.NODE_ENV !== "production"){
require('dotenv').config();
}
//require('dotenv').config();

console.log('Current Environment:', process.env.NODE_ENV);
 


//mongodb+srv://Walex_Gee:<db_password>@yelpcamp.ildqz.mongodb.net/?retryWrites=true&w=majority&appName=yelpcamp


const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const MongoStore = require('connect-mongo');

const mongoSanitize = require('express-mongo-sanitize');



const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const dbUrl = process.env.DB_URL 


mongoose.connect(dbUrl, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  dbName: 'yelpcamp'
})
.then(async () => {
  console.log(`Connected to MongoDB Atlas in ${process.env.NODE_ENV} mode`);
  console.log("Database:", mongoose.connection.name);

  if(process.env.NODE_ENV !== 'production') {
      try {
          const Campground = require('./models/campground');
          const campCount = await Campground.countDocuments();
          console.log(`Number of campgrounds: ${campCount}`);
      } catch(e) {
          console.error('Database check error:', e);
      }
  }
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
});

const { helmetConfig } = require('./security/helmet');


const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({replaceWith: '_'}));

helmetConfig(app);



const secret = process.env.SESSION_SECRET || 'thisshouldbeabettersecret!';
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret,
  }
});

store.on("error", function(e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      secure: false,  // Only use HTTPS in production
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
};



app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  //console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https') {
          res.redirect(`https://${req.header('host')}${req.url}`);
      } else {
          next();
      }
  });
}



app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);



app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
  if (process.env.NODE_ENV !== 'production') {
    err.stack = undefined;
  }
});


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
