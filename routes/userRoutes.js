const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const authenticateUser = require("../middlewares/authenticateUser");
const jobModel=require('../models/jobModel');

// Register Page
router.get('/register', (req, res) => {
    res.render('register');
});

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password, resume } = req.body;
    try {
        let person=await userModel.find({email});
        if(person.length>0){

            req.flash("error_msg","Account already created.Login");
            res.redirect('/user/register');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            resume
        });

        const token = jwt.sign({ email, id: user._id }, JWT_SECRET);
        res.cookie("token", token, { httpOnly: true });
        req.flash("success_msg","Register successfully.");
        res.redirect('/user/dashboard');
    } catch (err) {
        req.flash("error_msg","Error creating user");
        res.redirect('/user/register');
    }
});
router.get('/dashboard', authenticateUser,(req, res) => {
   res.render('dashboard', {user:req.user});
});
// Login Page
router.get('/login', (req, res) => {
    res.render('login');
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            req.flash("error_msg","SOME ERROR");
            return res.redirect("/user/login");
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.flash("error_msg","SOME ERROR");
            res.redirect("/user/login");

        }
        const token = jwt.sign({ email, id: user._id }, JWT_SECRET);
        res.cookie("token", token, { httpOnly: true });
        res.redirect('/user/dashboard');
    } catch (err) {
        req.flash("error_msg","error");
        res.redirect("/user/login");

    }
});
//Available jobs
router.get('/availableJobs',authenticateUser, async (req, res) => {
    try {
        const jobs = await jobModel.find();
        res.render('availableJobs', { jobs });
    } catch (err) {
        console.error(err);
        res.send("Error fetching jobs");
    }
});
// Logout
router.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.redirect('/user/login');
});
//Applied Jobs
router.get('/appliedJobs', authenticateUser, async (req, res) => {
    try{
        let jobs=await jobModel.find({"applicants.user": req.user.id});
        res.render('appliedJobs',{jobs});
    }
    catch(err){
        console.error(err.message);
        res.send("ERROR");
    }
})
module.exports = router;
