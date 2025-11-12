const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const jobModel = require('../models/jobModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateUser = require("../middlewares/authenticateUser");
const authenticateRecruiter = require("../middlewares/authenticateRecruiter");

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// JWT Secret (optional fallback)
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";

// 🔧 Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ⚙️ Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });


// 🌐 GET: Job listing page
router.get('/', authenticateUser, (req, res) => {
    res.render('jobs');
});

// 📝 POST: Apply to a job
router.get('/job/:id/applicants', authenticateRecruiter, async (req, res) => {
    const job = await jobModel.findById(req.params.id).populate("applicants.user");
    res.render('recruiter/applicants', { job });
});

// 📄 GET: View all jobs applied by the user
router.get('/applied', authenticateUser, async (req, res) => {
    const userId = req.user.id;

    try {
        const appliedJobs = await jobModel.find({
            "applicants.user": userId
        });
        res.render('appliedJobs', { jobs: appliedJobs });
    } catch (err) {
        console.error(err);
        res.send("Error fetching applied jobs");
    }
});

module.exports = router;