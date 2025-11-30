const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const wrapAsync = require("../Utils/wrapAsync.js");
const Review = require("../models/reviews.js");
const {
  validateReview,
  isReviewAuthor,
  isLoggedIn,
} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

//POST method review form
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

//Delete Review from route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroReview)
);

module.exports = router;
