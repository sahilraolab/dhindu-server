const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");
const { verifyToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
    validateLogin,
    validateCreateStaff,
    validateUpdateStaff,
} = require("../validators/staffValidator");

const router = express.Router();

// JWT secret key (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

/**
 * Login Staff
 * POST /api/staff/login
 */
router.post("/login", validateLogin, validateRequest, async (req, res) => {
    try {
        const { email, password } = req.body;

        const staff = await Staff.findOne({ email }).select("+password").populate("role");
        if (!staff) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, staff.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: staff._id, role: staff.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: "Login successful",
            staff: { ...staff.toObject(), password: undefined },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * Create Staff
 * POST /api/staff/create
 */
router.post(
    "/create",
    verifyToken,
    validateCreateStaff,
    validateRequest,
    async (req, res) => {
        try {
            const {
                name,
                email,
                phone,
                password,
                pos_login_pin,
                role,
                permissions,
                brands,
                outlets,
            } = req.body;

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const staffData = {
                name,
                email,
                phone,
                password: hashedPassword,
                role,
                permissions,
                brands,
                outlets,
            };

            if (pos_login_pin) {
                staffData.pos_login_pin = await bcrypt.hash(pos_login_pin, salt);
            }

            const newStaff = new Staff(staffData);
            await newStaff.save();

            res.status(201).json({
                message: "Staff created successfully",
                staff: { ...newStaff.toObject(), password: undefined, pos_login_pin: undefined },
            });
        } catch (error) {
            res.status(500).json({ message: "Error creating staff", error: error.message });
        }
    }
);

/**
 * Update Staff
 * PUT /api/staff/update/:id
 */
router.put(
    "/update/:id",
    verifyToken,
    validateUpdateStaff,
    validateRequest,
    async (req, res) => {
        try {
            const staffId = req.params.id;
            const updates = { ...req.body };

            const salt = await bcrypt.genSalt(10);

            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, salt);
            }

            if (updates.pos_login_pin) {
                updates.pos_login_pin = await bcrypt.hash(updates.pos_login_pin, salt);
            } else {
                delete updates.pos_login_pin;
            }

            const updatedStaff = await Staff.findByIdAndUpdate(staffId, updates, {
                new: true,
            }).select("-password -pos_login_pin");

            if (!updatedStaff) {
                return res.status(404).json({ message: "Staff not found" });
            }

            res.json({ message: "Staff updated successfully", staff: updatedStaff });
        } catch (error) {
            res.status(500).json({ message: "Error updating staff", error: error.message });
        }
    }
);

/**
 * Fetch Staff by Brand and Outlet
 * GET /api/staff/staff?brand_id=&outlet_id=
 */
router.get("/staff", verifyToken, async (req, res) => {
    try {
        const { brand_id, outlet_id } = req.query;

        if (!brand_id || !outlet_id) {
            return res.status(400).json({ message: "brand_id and outlet_id are required" });
        }

        const staff = await Staff.find({
            brands: brand_id,
            outlets: outlet_id,
        })
            .populate("brands outlets")
            .select("-password -pos_login_pin");

        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ message: "Error fetching staff", error: error.message });
    }
});

/**
 * Fetch Authorized Staff (based on user's brands/outlets and staff_manage permission)
 * GET /api/staff/staff/authorized
 */
router.get("/staff/authorized", verifyToken, async (req, res) => {
    try {
        const currentUserId = req.staff._id;
        const currentUser = await Staff.findById(currentUserId);

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.permissions.includes("staff_manage")) {
            return res.status(403).json({ message: "Access denied: staff_manage permission required" });
        }

        const staff = await Staff.find({
            brands: { $in: currentUser.brands },
            outlets: { $in: currentUser.outlets },
        })
            .populate("brands outlets role")
            .select("-password -pos_login_pin");

        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ message: "Error fetching authorized staff", error: error.message });
    }
});

module.exports = router;
