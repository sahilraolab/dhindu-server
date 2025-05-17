const express = require("express");
const router = express.Router();

const Outlet = require("../models/Outlet");
const Brand = require("../models/Brand");
const Staff = require("../models/Staff");

const { verifyToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { outletValidationRules } = require("../validators/outletValidator");

// 🔄 Shared helper to assign outlet to admin staff under same owner
async function assignOutletToAdmins(outletId, ownerId) {
    const staff = await Staff.find({ owner_id: ownerId }).populate("role");

    const adminIds = staff
        .filter(s => s.role?.name?.toLowerCase() === "admin")
        .map(s => s._id);

    if (adminIds.length > 0) {
        await Staff.updateMany(
            { _id: { $in: adminIds } },
            { $addToSet: { outlets: outletId } }
        );
    }
}

// ✅ Create an Outlet & Update Staff
router.post("/", verifyToken, outletValidationRules, validateRequest, async (req, res) => {
    try {
        if (!req.staff?.permissions?.includes("outlet_manage")) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        const {
            brand_id,
            name,
            code,
            email,
            phone,
            country_code,
            timezone,
            opening_time,
            closing_time,
            website,
            street,
            city,
            state,
            country,
            postal_code,
            status
        } = req.body;

        const brand = await Brand.findById(brand_id);
        if (!brand) return res.status(404).json({ message: "Brand not found!" });

        const outlet = await Outlet.create({
            brand_id,
            name,
            code,
            email,
            phone,
            country_code,
            timezone,
            opening_time,
            closing_time,
            website,
            street,
            city,
            state,
            country,
            postal_code,
            status: status || "active"
        });

        // Assign outlet to all admin staff under same owner
        await assignOutletToAdmins(outlet._id, brand.owner_id);

        // Also assign to the creating staff
        await Staff.findByIdAndUpdate(
            req.staff.id,
            { $addToSet: { outlets: outlet._id } },
            { new: true }
        );

        return res.status(201).json({
            message: "Outlet created successfully!",
            outlet
        });
    } catch (error) {
        console.error("Error creating outlet:", error);
        return res.status(500).json({ message: "Server error! Unable to create outlet." });
    }
});

// ✅ Update Outlet by ID
router.put("/:id", verifyToken, outletValidationRules, validateRequest, async (req, res) => {
    try {
        const { id } = req.params;

        const outlet = await Outlet.findById(id);
        if (!outlet) return res.status(404).json({ message: "Outlet not found!" });

        const hasAccess =
            req.staff?.permissions?.includes("outlet_manage") ||
            req.staff.outlets.map((o) => o.toString()).includes(id);

        if (!hasAccess) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        const updatedOutlet = await Outlet.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        return res.status(200).json({
            message: "Outlet updated successfully!",
            outlet: updatedOutlet,
        });
    } catch (error) {
        console.error("Error updating outlet:", error);
        return res.status(500).json({ message: "Server error! Unable to update outlet." });
    }
});

module.exports = router;
