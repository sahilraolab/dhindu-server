const express = require("express");
const router = express.Router();

const Brand = require("../models/Brand");
const Staff = require("../models/Staff");
const { verifyToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { brandValidationRules } = require("../validators/brandValidator");

// 🔄 Shared helper to assign a brand to all admin staff (under same owner)
async function assignBrandToAdmins(brandId, ownerId) {
    const staff = await Staff.find({ owner_id: ownerId }).populate("role");

    const adminIds = staff
        .filter(s => s.role?.name?.toLowerCase() === "admin")
        .map(s => s._id);

    if (adminIds.length > 0) {
        await Staff.updateMany(
            { _id: { $in: adminIds } },
            { $addToSet: { brands: brandId } }
        );
    }
}

// ✅ Create a Brand & Link to Staff
router.post("/", verifyToken, brandValidationRules, validateRequest, async (req, res) => {
    try {
        if (!req.staff?.permissions.includes("brand_manage")) {
            return res.status(403).json({ message: "Access denied. Permission required." });
        }

        const brand = new Brand({
            ...req.body,
            owner_id: req.staff.id,
            status: req.body.status || "active"
        });

        await brand.save();

        await assignBrandToAdmins(brand._id, req.staff.id);

        res.status(201).json({
            message: "Brand created successfully.",
            brand
        });
    } catch (error) {
        console.error("Create Brand Error:", error.message);
        res.status(500).json({ message: "Server error. Could not create brand." });
    }
});

// ✅ Update Brand by ID
router.put("/:id", verifyToken, brandValidationRules, validateRequest, async (req, res) => {
    try {
        if (!req.staff?.permissions.includes("brand_manage")) {
            return res.status(403).json({ message: "Access denied. Permission required." });
        }

        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ message: "Brand not found." });
        }

        const updatedBrand = await Brand.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        await assignBrandToAdmins(updatedBrand._id, req.staff.id);

        res.status(200).json({
            message: "Brand updated successfully.",
            brand: updatedBrand
        });
    } catch (error) {
        console.error("Update Brand Error:", error.message);
        res.status(500).json({ message: "Server error. Could not update brand." });
    }
});

module.exports = router;
