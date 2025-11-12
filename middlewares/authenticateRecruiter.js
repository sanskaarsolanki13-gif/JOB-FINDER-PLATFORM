const jwt = require("jsonwebtoken");
const recruiterModel = require("../models/recruiterModel");

const authenticateRecruiter = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            // console.log("miss");
            return res.redirect("/recruiter/login");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const recruiter = await recruiterModel.findById(decoded.id);
        if (!recruiter) {
            return res.redirect("/recruiter/login");
        }

        req.recruiter = recruiter;
        next();
    } catch (err) {
        console.error("Recruiter auth error:", err);
        res.redirect("/recruiter/login");
    }
};

module.exports = authenticateRecruiter;