const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../middleware");
const passport = require("passport");
const User = require("../models/user");
const users = require("../controllers/users");

// Map email to username for compatibility with any middleware expecting 'username'
function mapEmailToUsername(req, res, next) {
  if (req.body && req.body.email && !req.body.username) {
    req.body.username = req.body.email;
  }
  next();
}

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router.get("/login", users.renderLogin);

router.post(
  "/login",
  mapEmailToUsername,
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    usernameField: 'email'
  }),
  users.login
);

router.get("/logout", users.logout);

module.exports = router;
