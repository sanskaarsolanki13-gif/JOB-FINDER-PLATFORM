const express = require("express");
const app = express();

require("dotenv").config();
require("./config/mongooseConnect");

const userRoutes = require("./routes/userRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

// This will make /uploads accessible via the browser
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use("/user", userRoutes);
app.use("/jobs", jobsRoutes);
app.use("/recruiter", recruiterRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(3000);
