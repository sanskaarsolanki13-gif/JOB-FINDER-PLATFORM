const express = require("express");
const router = express.Router();
const recruiterModel = require("../models/recruiterModel");
const jobModel = require("../models/jobModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateRecruiter = require("../middlewares/authenticateRecruiter");
const userModel = require("../models/userModel");
//Register Recuiter
router.get("/register", (req, res) => {
    res.render("recruiter/register");
})
router.post("/register", async (req, res) => {
    const {email, password,name,companyName} = req.body;
    let person=await recruiterModel.find({email});
    if(person.length>0){
        req.flash("error_msg","Person already exists");
        return res.redirect("/recruiter/register");
    }
    try{
        const salt=await bcrypt.genSalt(10);
        const hash=await bcrypt.hash(password, salt);
        const recruiter=await recruiterModel.create({
            name,
            email,
            password:hash,
            companyName,
        })
        const token=jwt.sign({email,id:recruiter._id}, JWT_SECRET);
        res.cookie("token",token);
        req.flash("success_msg","Successfully registered successfully");
        res.redirect("/recruiter/dashboard");
    }
    catch(err){
        req.flash("error_msg","Something went wrong");
        res.redirect("/recruiter/register");
    }
})

// Login Recruiter
router.get('/login', (req, res) => {
    res.render("recruiter/login");
})
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const recruiter = await recruiterModel.findOne({ email });
    if (!recruiter) return res.send("Invalid credentials");

    const match = await bcrypt.compare(password, recruiter.password);
    if (!match) {
        req.flash("error_mssg", "Invalid credentials");
        return res.redirect("/recruiter/login");
    }
    const token = jwt.sign({ id: recruiter._id, email }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    req.flash("success_msg", "Login successfull");
    res.redirect("/recruiter/dashboard");
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie("token");
    req.flash("success_msg", "Logout successfull");
    res.redirect("/recruiter/login");
});

// Dashboard
router.get('/dashboard', authenticateRecruiter, async (req, res) => {
    const recruiter = await recruiterModel.findById(req.recruiter._id).populate('jobsPosted');
    res.render('recruiter/dashboard', { recruiter, jobs: recruiter.jobsPosted });
});

// Post Job
router.get('/postJob', authenticateRecruiter, (req, res) => {
    req.flash("success_msg", "PostJob successfull");
    res.render('recruiter/postJob');
});

router.post('/postJob', authenticateRecruiter, async (req, res) => {
    const { title,description, location, salary } = req.body;
    try {
        const job = await jobModel.create({
            title,
            description,
            location,
            companyName: req.recruiter.companyName,
            salary,
            postedBy: req.recruiter.id
        });
        req.recruiter.jobsPosted.push(job);
        await req.recruiter.save();
        req.flash("success_msg", "PostJob successfull successfull");
        res.redirect('/recruiter/dashboard');
    }
    catch (error) {
        req.flash("error_mssg", "PostJob failed");
        res.redirect("/recruiter/postJob");
    }
});

// View Applicants
router.get('/job/:id/applicants', authenticateRecruiter, async (req, res) => {
    const job = await jobModel.findById(req.params.id).populate("applicants.user");
    res.render('recruiter/applicants', { job });
});

module.exports = router;
