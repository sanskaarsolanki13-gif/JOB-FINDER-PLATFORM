const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";

function authenticateUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect("/user/login");

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        return res.redirect("/user/login");
    }
}

module.exports = authenticateUser;