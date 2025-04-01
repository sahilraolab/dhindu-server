const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

// Secret key for JWT (Store this in .env in production)
const JWT_SECRET = "your_secret_key";

// **1. Login API**
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const staff = await Staff.findOne({ email }).select("+password"); // Ensure password field is included

        if (!staff) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, staff.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: staff._id, role: staff.role }, JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true, // Prevents JavaScript access (XSS protection)
            secure: process.env.NODE_ENV === "production", // Only HTTPS in production
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
        });
        res.json({ message: "Login successful", staff: { ...staff.toObject(), password: undefined } });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// **2. Create Staff**
router.post("/create", verifyToken, async (req, res) => {
    try {
        const { name, email, phone, password, pos_login_pin, role, permissions, brands, outlets } = req.body;

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Hash POS PIN before saving
        const hashedPin = await bcrypt.hash(pos_login_pin, salt);

        const newStaff = new Staff({
            name,
            email,
            phone,
            password: hashedPassword,
            pos_login_pin: hashedPin,
            role,
            permissions,
            brands,
            outlets,
        });

        await newStaff.save();
        res.status(201).json({ message: "Staff created successfully", staff: newStaff });
    } catch (error) {
        res.status(500).json({ message: "Error creating staff", error });
    }
});

// **3. Update Staff**
router.put("/update/:id", verifyToken, async (req, res) => {
    try {
        const staffId = req.params.id;
        const updates = req.body;

        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        if (updates.pos_login_pin) {
            const salt = await bcrypt.genSalt(10);
            updates.pos_login_pin = await bcrypt.hash(updates.pos_login_pin, salt);
        }

        const updatedStaff = await Staff.findByIdAndUpdate(staffId, updates, { new: true });
        if (!updatedStaff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        res.json({ message: "Staff updated successfully", staff: updatedStaff });
    } catch (error) {
        res.status(500).json({ message: "Error updating staff", error });
    }
});

// **4. Delete Staff**
router.delete("/delete/:id", verifyToken, async (req, res) => {
    try {
        const staffId = req.params.id;
        const deletedStaff = await Staff.findByIdAndDelete(staffId);

        if (!deletedStaff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        res.json({ message: "Staff deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting staff", error });
    }
});

// **5. Fetch All Staff**
router.get("/all", verifyToken, async (req, res) => {
    try {
        const staffList = await Staff.find()
            .populate("brands")
            .populate("outlets")
            .select("-password"); // Exclude password field

        res.json({ message: "Staff fetched successfully", staff: staffList });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching staff", error });
    }
});

// **6. Fetch Staff by Brand and Outlet**
router.get("/staff", verifyToken, async (req, res) => {
    try {
        const { brand_id, outlet_id } = req.query;

        if (!brand_id || !outlet_id) {
            return res.status(400).json({ message: "brand_id and outlet_id are required" });
        }

        // Find staff members who belong to the given brand and outlet
        const staff = await Staff.find({
            brands: brand_id,
            outlets: outlet_id,
        }).populate("brands outlets");

        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
