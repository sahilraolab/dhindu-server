const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { verifyToken } = require("../middleware/authMiddleware");

// Fetch Categories for current staff's brands & outlets
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        const categories = await Category.find({
            brand_id: { $in: brands },
            outlet_id: { $in: outlets }
        }).populate("brand_id").populate("outlet_id");

        res.status(200).json({
            message: "Accessible categories fetched successfully",
            categories,
        });
    } catch (error) {
        console.error("Error fetching accessible categories:", error);
        res.status(500).json({
            message: "Error fetching categories",
            error: error.message || error,
        });
    }
});

// Create Category
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brand_id, outlet_id, name, day, start_time, end_time, status } = req.body;

        if (!brand_id || !outlet_id || !name) {
            return res.status(400).json({ message: "brand_id, outlet_id, and name are required fields." });
        }

        // Check if category already exists (only if day is present)
        let existingCategory = null;
        if (day) {
            existingCategory = await Category.findOne({ brand_id, outlet_id, name, day });
        }

        if (existingCategory) {
            return res.status(400).json({
                message: "Category with this name already exists for this brand/outlet on this day."
            });
        }

        const newCategory = new Category({ brand_id, outlet_id, name, day, start_time, end_time, status });
        await newCategory.save();

        res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Error creating category", error: error.message || error });
    }
});

// Update Category
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Update fields
        Object.assign(category, req.body);
        await category.save();

        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Error updating category", error: error.message || error });
    }
});

module.exports = router;
