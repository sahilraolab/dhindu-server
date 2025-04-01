const express = require("express");
const router = express.Router();
const Brand = require("../models/Brand");
const { verifyToken } = require("../middleware/authMiddleware");
const Staff = require("../models/Staff");

// ✅ Create a Brand & Update Staff (Protected Route)
router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            name, short_name, email, phone, gst_no, license_no, food_license, website,
            city, state, country, postal_code, street_address, status
        } = req.body;

        if (!req.staff || (!req.staff.permissions.includes("staff_manage") || req.staff.role !== "admin")) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        // Create new brand
        const brand = new Brand({
            name,
            short_name,
            email,
            phone,
            owner_id: req.staff.id,
            gst_no,
            license_no,
            food_license,
            website,
            city,
            state,
            country,
            postal_code,
            street_address,
            status: status || "active", // Default to 'active' if not provided
        });

        await brand.save();

        // ✅ Update Staff document to include this brand ID
        const staffUpdate = await Staff.findByIdAndUpdate(
            req.staff.id,
            { $push: { brands: brand._id } },
            { new: true }
        );

        if (!staffUpdate) {
            return res.status(404).json({ message: "Staff not found, but brand created!" });
        }

        res.status(201).json({
            message: "Brand created successfully and staff updated!",
            brand,
            updatedStaff: staffUpdate
        });
    } catch (error) {
        console.error("Error creating brand:", error);
        res.status(500).json({ message: "Server error! Unable to create brand." });
    }
});

// ✅ Get Only Assigned Brands (Protected Route)
router.get("/", verifyToken, async (req, res) => {
    try {
        if (!req.staff || !req.staff.brands || req.staff.brands.length === 0) {
            return res.status(403).json({ message: "Access denied! No brands assigned." });
        }

        const brands = await Brand.find({ _id: { $in: req.staff.brands } });
        res.status(200).json(brands);
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).json({ message: "Server error! Unable to fetch brands." });
    }
});

// ✅ Get Only Assigned Brands with short_name and ID (Protected Route)
router.get("/assigned/short", verifyToken, async (req, res) => {
    try {
        if (!req.staff || !req.staff.brands || req.staff.brands.length === 0) {
            return res.status(403).json({ message: "Access denied! No brands assigned." });
        }

        const brands = await Brand.find(
            { _id: { $in: req.staff.brands } },
            { short_name: 1 } // Select only short_name and _id
        );

        res.status(200).json(brands);
    } catch (error) {
        console.error("Error fetching assigned brands:", error);
        res.status(500).json({ message: "Server error! Unable to fetch brands." });
    }
});

// ✅ Get Brand by ID (Protected Route)
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({ message: "Brand not found!" });
        }

        if (!req.staff.brands.includes(req.params.id) || req.staff.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        res.status(200).json(brand);
    } catch (error) {
        console.error("Error fetching brand by ID:", error);
        res.status(500).json({ message: "Server error! Unable to fetch brand." });
    }
});

// ✅ Update Brand by ID (Protected Route - Only Admin & staff_manage)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, short_name, email, phone, gst_no, license_no, food_license, website,
            city, state, country, postal_code, street_address, status
        } = req.body;

        // Check if user has permission
        if (!req.staff || (!req.staff.permissions.includes("staff_manage") || req.staff.role !== "admin")) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        // Find the brand
        const brand = await Brand.findById(id);
        if (!brand) {
            return res.status(404).json({ message: "Brand not found!" });
        }

        // Update brand details
        const updatedBrand = await Brand.findByIdAndUpdate(
            id,
            {
                name,
                short_name,
                email,
                phone,
                gst_no,
                license_no,
                food_license,
                website,
                city,
                state,
                country,
                postal_code,
                street_address,
                status
            },
            { new: true }
        );

        res.status(200).json({ message: "Brand updated successfully!", brand: updatedBrand });
    } catch (error) {
        console.error("Error updating brand:", error);
        res.status(500).json({ message: "Server error! Unable to update brand." });
    }
});

module.exports = router;
