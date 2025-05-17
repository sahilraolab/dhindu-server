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

        const staff = await Staff.findOne({ email })
            .populate("role")
            .populate("brands")
            .populate("outlets");

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
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Convert to plain object and remove sensitive fields
        const staffData = staff.toObject();
        delete staffData.password;
        delete staffData.pos_login_pin;
        delete staffData.__v;
        delete staffData.$__;

        res.json({
            message: "Login successful",
            token,
            staff: staffData,
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
                country_code,
                image,
                password,
                pos_login_pin,
                role,
                owner_id,
                permissions,
                brands,
                outlets,
            } = req.body;

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            let staffData = {
                name,
                email,
                image,
                phone,
                country_code,
                password: hashedPassword,
                role,
                owner_id,
                permissions,
                brands,
                outlets,
            };

            if (pos_login_pin) {
                staffData.pos_login_pin = await bcrypt.hash(pos_login_pin, salt);
            }

            // ✅ Check if role is admin and override brands/outlets
            if (role) {
                const StaffModel = require("../models/Staff");
                const RoleStaff = await StaffModel.findById(role).populate("role");
                const roleName = RoleStaff?.role?.name?.toLowerCase();

                if (roleName === "admin") {
                    const Brand = require("../models/Brand");
                    const Outlet = require("../models/Outlet");

                    const brandList = await Brand.find({ owner_id });
                    const brandIds = brandList.map(b => b._id);

                    const outletList = await Outlet.find({ brand_id: { $in: brandIds } });
                    const outletIds = outletList.map(o => o._id);

                    // 🔄 Override manual values
                    staffData.brands = brandIds;
                    staffData.outlets = outletIds;
                }
            }

            const newStaff = new Staff(staffData);
            await newStaff.save();

            // Populate fields before sending response
            await newStaff.populate("brands outlets role");

            res.status(201).json({
                message: "Staff created successfully",
                staff: {
                    ...newStaff.toObject(),
                    password: undefined,
                    pos_login_pin: undefined,
                },
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
            const loggedInStaff = req.staff;
            const updatePayload = { ...req.body };

            const salt = await bcrypt.genSalt(10);

            // Hash password and pos_login_pin if provided
            if (updatePayload.password) {
                updatePayload.password = await bcrypt.hash(updatePayload.password, salt);
            }
            if (updatePayload.pos_login_pin) {
                updatePayload.pos_login_pin = await bcrypt.hash(updatePayload.pos_login_pin, salt);
            } else {
                delete updatePayload.pos_login_pin;
            }

            const existingStaff = await Staff.findById(staffId).populate("role");

            if (!existingStaff) {
                return res.status(404).json({ message: "Staff not found" });
            }

            const isAdmin = existingStaff.role?.name?.toLowerCase() === "admin";
            const isSelfUpdate = loggedInStaff._id.toString() === staffId.toString();

            // ✋ Prevent non-self admins from editing restricted fields
            if (isAdmin && isSelfUpdate) {
                // Allow only personal info updates
                delete updatePayload.role;
                delete updatePayload.permissions;
                delete updatePayload.brands;
                delete updatePayload.outlets;
            }

            // ✅ If role is being changed TO admin, assign all brands/outlets under owner's ID
            if (updatePayload.role && !isAdmin) {
                const newRoleStaff = await Staff.findById(updatePayload.role).populate("role");
                const newRoleName = newRoleStaff?.role?.name?.toLowerCase();

                if (newRoleName === "admin") {
                    const Brand = require("../models/Brand");
                    const Outlet = require("../models/Outlet");

                    // Use owner_id from request body (new owner) or fallback to existing
                    const ownerId = updatePayload.owner_id || existingStaff.owner_id;

                    const allBrands = await Brand.find({ owner_id: ownerId });
                    const brandIds = allBrands.map(b => b._id);

                    const allOutlets = await Outlet.find({ brand_id: { $in: brandIds } });
                    const outletIds = allOutlets.map(o => o._id);

                    updatePayload.brands = brandIds;
                    updatePayload.outlets = outletIds;
                }
            }

            const updatedStaff = await Staff.findByIdAndUpdate(
                staffId,
                updatePayload,
                { new: true }
            )
                .select("-password -pos_login_pin")
                .populate("brands outlets role");

            res.json({ message: "Staff updated successfully", staff: updatedStaff });
        } catch (error) {
            console.error("Update Staff Error:", error.message);
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
            // outlets: { $in: currentUser.outlets },
        })
            .populate("brands outlets role")
            .select("-password -pos_login_pin");

        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ message: "Error fetching authorized staff", error: error.message });
    }
});

module.exports = router;
