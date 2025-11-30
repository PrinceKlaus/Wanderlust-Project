if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
console.log("DB URL:", process.env.ATLASDB_URL);
// require("dotenv").config();
const dbUrl = process.env.ATLASDB_URL || MONGO_URL;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = "8080";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./Utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// mongoose DB connection
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dbUrl =
//   "mongodb+srv://PrinceMongoDB:wAXe8tIw454j2vqw@cluster0.u2zger6.mongodb.net/?appName=Cluster0";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(`Some error in DB : ${err}`);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "/public/js")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  // crypto: {
  //   secret: process.env.SECRET,
  // },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in MongoStore", err);
});

const sessionOptions = {
  store: store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

//Home Route
// app.get("/", (req, res) => {
//   res.send("Listening to root directory");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//error handling
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// error handling Middleware
// app.use((err, req, res, next) => {
//   let { status = 500, message = "Something went wrong" } = err;
//   res.status(status).render("error.ejs", { message });
// });
// app.use((err, req, res, next) => {
//   if (res.headersSent) {
//     return next(err);   // prevents double send
//   }

//   let { status = 500, message = "Something went wrong" } = err;
//   res.status(status).render("error.ejs", { message });
// });

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;

  // DEFENSIVE CHECK: Prevent responding if headers were already sent
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

//server
app.listen(port, () => {
  console.log(`The server is listening to port number : ${port}`);
});
