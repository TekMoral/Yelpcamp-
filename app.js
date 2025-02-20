if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const crypto = require('crypto');
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");
const mongoSanitize = require("express-mongo-sanitize");
const User = require("./models/user");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");


const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelpcamp";

mongoose.connect(dbUrl)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({ replaceWith: "_" }));

app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-eval'",
              "https://cdn.jsdelivr.net",
              "https://api.mapbox.com",
              "https://code.jquery.com",
              "https://cdn.jsdelivr.net",
              "https://stackpath.bootstrapcdn.com" 
          ],
          styleSrc: [
              "'self'",
              "'unsafe-inline'",
              "https://cdn.jsdelivr.net",
              "https://api.mapbox.com",
              "https://fonts.googleapis.com",
              "https://stackpath.bootstrapcdn.com", 
              "https://cdnjs.cloudflare.com"  // Add this for starability styles
          ],
          workerSrc: [
              "'self'",
              "blob:"
          ],
          childSrc: [
              "blob:"
          ],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com",
              "https://images.unsplash.com",
              "https://api.mapbox.com"
          ],
          connectSrc: [
              "'self'",
              "https://api.mapbox.com",
              "https://events.mapbox.com"
          ],
          fontSrc: [
              "'self'",
              "https://fonts.gstatic.com"
          ]
      },
      crossOriginEmbedderPolicy: false
  })
);




const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SECRET
  }
});

store.on("error", (e) => console.log("SESSION STORE ERROR", e));

const sessionConfig = {
  store,
  name: 'session',
  secret: process.env.SECRET || "thismustbeatopsecret",
  resave: false,
  saveUninitialized: process.env.NODE_ENV !== "production",
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    expires: Date.now() + 1000 * 60 * 60 * 12,
    maxAge: 1000 * 60 * 60 * 12
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
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => res.render("home"));

app.all("*", (req, res, next) => next(new ExpressError("Page Not Found", 404)));

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).render('error', { 
      title: 'Error',
      err,
      // Don't expose stack trace in production
      stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
});



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
