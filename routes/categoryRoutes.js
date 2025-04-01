const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const verifyToken = require("../middlewares/verifyToken");

// Create Category
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("categories_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brand_id, apply_on_all_outlets, outlet_id, name, day, start_time, end_time, status } = req.body;

        // Check if category with the same brand, name, and day exists
        const existingCategory = await Category.findOne({ brand_id, name, day });
        if (existingCategory) {
            return res.status(400).json({ message: "Category with this name already exists for this brand on this day." });
        }

        // Create new category
        const newCategory = new Category({ brand_id, apply_on_all_outlets, outlet_id, name, day, start_time, end_time, status });
        await newCategory.save();

        res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Error creating category", error });
    }
});

// Update Category
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("categories_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        Object.assign(category, req.body); // Update fields
        await category.save();
        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Error updating category", error });
    }
});

// Delete Category
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("categories_delete") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Error deleting category", error });
    }
});

// Fetch All Categories
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("categories_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const categories = await Category.find().populate("brand_id").populate("outlet_id");
        res.status(200).json({ message: "Categories fetched successfully", categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories", error });
    }
});

// Fetch Single Category
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("categories_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const category = await Category.findById(req.params.id).populate("brand_id").populate("outlet_id");
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category fetched successfully", category });
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: "Error fetching category", error });
    }
});

module.exports = router;
