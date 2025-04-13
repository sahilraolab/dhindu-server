const express = require("express");
const router = express.Router();

const Brand = require("../models/Brand");
const Staff = require("../models/Staff");
const { verifyToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { brandValidationRules } = require("../validators/brandValidator");

// ✅ Create a Brand & Link to Staff
router.post("/", verifyToken, brandValidationRules, validateRequest, async (req, res) => {
    try {
        const {
            full_name, short_name, email, phone, gst_no, license_no, food_license,
            website, city, state, country, postal_code, street_address, status
        } = req.body;

        if (!req.staff?.permissions.includes("staff_manage")) {
            return res.status(403).json({ message: "Access denied. Permission required." });
        }

        const brand = new Brand({
            full_name, short_name, email, phone,
            owner_id: req.staff.id,
            gst_no, license_no, food_license,
            website, city, state, country,
            postal_code, street_address,
            status: status || "active"
        });

        await brand.save();

        const updatedStaff = await Staff.findByIdAndUpdate(
            req.staff.id,
            { $push: { brands: brand._id } },
            { new: true }
        );

        res.status(201).json({
            message: "Brand created successfully.",
            brand,
            updatedStaff
        });

    } catch (error) {
        console.error("Create Brand Error:", error.message);
        res.status(500).json({ message: "Server error. Could not create brand." });
    }
});

// ✅ Get Assigned Brands
router.get("/", verifyToken, async (req, res) => {
    try {
        if (!req.staff?.brands?.length) {
            return res.status(403).json({ message: "No assigned brands found." });
        }

        const brands = await Brand.find({ _id: { $in: req.staff.brands } });
        res.status(200).json(brands);

    } catch (error) {
        console.error("Fetch Brands Error:", error.message);
        res.status(500).json({ message: "Server error. Could not fetch brands." });
    }
});

// ✅ Get Assigned Brands (Short View)
router.get("/assigned/short", verifyToken, async (req, res) => {
    try {
        if (!req.staff?.brands?.length) {
            return res.status(403).json({ message: "No assigned brands found." });
        }

        const brands = await Brand.find(
            { _id: { $in: req.staff.brands } },
            { short_name: 1 }
        );

        res.status(200).json(brands);

    } catch (error) {
        console.error("Fetch Short Brands Error:", error.message);
        res.status(500).json({ message: "Server error. Could not fetch brands." });
    }
});

// ✅ Update Brand by ID
router.put("/:id", verifyToken, brandValidationRules, validateRequest, async (req, res) => {
    try {
        if (!req.staff?.permissions.includes("staff_manage")) {
            return res.status(403).json({ message: "Access denied. Permission required." });
        }

        const { id } = req.params;

        const brand = await Brand.findById(id);
        if (!brand) {
            return res.status(404).json({ message: "Brand not found." });
        }

        const {
            full_name, short_name, email, phone, gst_no, license_no, food_license,
            website, city, state, country, postal_code, street_address, status
        } = req.body;

        const updatedBrand = await Brand.findByIdAndUpdate(
            id,
            {
                full_name, short_name, email, phone,
                gst_no, license_no, food_license, website,
                city, state, country, postal_code,
                street_address, status
            },
            { new: true }
        );

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
