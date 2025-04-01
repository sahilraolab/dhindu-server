const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const verifyToken = require("../middlewares/verifyToken");

// Create Menu
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("menus_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brand_id, apply_on_all_outlets, outlet_id, name, status, apply_on_all_order_types, order_types } = req.body;

        // Check if menu with the same brand and name exists
        const existingMenu = await Menu.findOne({ brand_id, name });
        if (existingMenu) {
            return res.status(400).json({ message: "Menu with this name already exists for this brand." });
        }

        // Create new menu
        const newMenu = new Menu({ brand_id, apply_on_all_outlets, outlet_id, name, status, apply_on_all_order_types, order_types });
        await newMenu.save();

        res.status(201).json({ message: "Menu created successfully", menu: newMenu });
    } catch (error) {
        console.error("Error creating menu:", error);
        res.status(500).json({ message: "Error creating menu", error });
    }
});

// Update Menu
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("menus_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) {
            return res.status(404).json({ message: "Menu not found" });
        }

        Object.assign(menu, req.body); // Update fields
        await menu.save();
        res.status(200).json({ message: "Menu updated successfully", menu });
    } catch (error) {
        console.error("Error updating menu:", error);
        res.status(500).json({ message: "Error updating menu", error });
    }
});

// Delete Menu
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("menus_delete") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) {
            return res.status(404).json({ message: "Menu not found" });
        }

        await Menu.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Menu deleted successfully" });
    } catch (error) {
        console.error("Error deleting menu:", error);
        res.status(500).json({ message: "Error deleting menu", error });
    }
});

// Fetch All Menus
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("menus_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const menus = await Menu.find().populate("brand_id").populate("outlet_id").populate("order_types");
        res.status(200).json({ message: "Menus fetched successfully", menus });
    } catch (error) {
        console.error("Error fetching menus:", error);
        res.status(500).json({ message: "Error fetching menus", error });
    }
});

// Fetch Single Menu
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("menus_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const menu = await Menu.findById(req.params.id).populate("brand_id").populate("outlet_id").populate("order_types");
        if (!menu) {
            return res.status(404).json({ message: "Menu not found" });
        }

        res.status(200).json({ message: "Menu fetched successfully", menu });
    } catch (error) {
        console.error("Error fetching menu:", error);
        res.status(500).json({ message: "Error fetching menu", error });
    }
});

module.exports = router;
