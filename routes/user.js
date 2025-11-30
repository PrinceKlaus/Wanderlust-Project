const express = require("express");
const router = express.Router();
const wrapAsync = require("../Utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.signupFormRender)
  .post(wrapAsync(userController.newSignupUser));

router
  .route("/login")
  .get(userController.userLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.postUserLogin
  );

router.get("/logout", userController.logout);

module.exports = router;
