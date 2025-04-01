const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");

exports.verifyToken = async (req, res, next) => {
    try {
        // Check if token is in the cookies
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized! No token provided." });
        }

        // Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch staff details from the database
        req.staff = await Staff.findById(decoded.id).select("-password"); // Exclude password from staff info

        if (!req.staff) {
            return res.status(401).json({ message: "Staff not found!" });
        }

        console.log("Staff details:", req.staff); // Optional, can be removed in production
        next(); // Proceed to the next middleware/controller

    } catch (error) {
        console.error("JWT Error:", error); // Log the error
        res.status(401).json({ message: "Invalid token! Access denied." });
    }
};
