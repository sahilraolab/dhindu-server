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
        })
            .populate("brand_id")
            .populate("outlet_id");

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

        // Validate day is one of the allowed strings (optional here, Mongoose handles it)
        const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        if (day && !validDays.includes(day)) {
            return res.status(400).json({ message: "Invalid day value provided." });
        }

        const existingCategory = await Category.findOne({ outlet_id, name });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category name must be unique within the same outlet."
            });
        }

        const newCategory = new Category({
            brand_id,
            outlet_id,
            name,
            day,
            start_time,
            end_time,
            status
        });

        await newCategory.save();

        const populatedCategory = await Category.findById(newCategory._id)
            .populate("brand_id")
            .populate("outlet_id");

        res.status(201).json({ message: "Category created successfully", category: populatedCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Category name already exists in this outlet."
            });
        }
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

        const { outlet_id, name, day } = req.body;

        // Validate day if passed
        const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        if (day && !validDays.includes(day)) {
            return res.status(400).json({ message: "Invalid day value provided." });
        }

        // Only check uniqueness if name or outlet_id changed
        if ((name && name !== category.name) || (outlet_id && outlet_id.toString() !== category.outlet_id.toString())) {
            const existingCategory = await Category.findOne({
                _id: { $ne: category._id },
                outlet_id: outlet_id || category.outlet_id,
                name: name || category.name
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: "Another category with this name already exists in this outlet."
                });
            }
        }

        Object.assign(category, req.body);
        await category.save();

        const updatedCategory = await Category.findById(category._id)
            .populate("brand_id")
            .populate("outlet_id");

        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.error("Error updating category:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Category name already exists in this outlet."
            });
        }
        res.status(500).json({ message: "Error updating category", error: error.message || error });
    }
});

// Fetch Categories by Outlet ID
router.get("/by-outlet/:outletId", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { outletId } = req.params;

        const categories = await Category.find({ outlet_id: outletId })
            .populate("brand_id")
            .populate("outlet_id");

        res.status(200).json({
            message: "Categories fetched successfully by outlet ID",
            categories,
        });
    } catch (error) {
        console.error("Error fetching categories by outlet ID:", error);
        res.status(500).json({
            message: "Error fetching categories",
            error: error.message || error,
        });
    }
});

module.exports = router;
