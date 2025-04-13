const express = require("express");
const router = express.Router();
const Addon = require("../models/Addon");
const { verifyToken } = require("../middleware/authMiddleware");

// Create Addon
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("addons_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const {
            name,
            brand_id,
            outlet_id,
            menu_id = null,
            category_id = null,
            items = [],
            price,
            status = "active",
            all_items = false
        } = req.body;


        // Check for existing addon
        const existingAddon = await Addon.findOne({ brand_id, outlet_id, name });
        if (existingAddon) {
            return res.status(400).json({ message: "Addon with this name already exists for this brand and outlet." });
        }

        const newAddon = new Addon({
            name,
            brand_id,
            outlet_id,
            menu_id,
            category_id,
            items,
            price,
            status,
            all_items
        });

        await newAddon.save();
        res.status(201).json({ message: "Addon created successfully", addon: newAddon });
    } catch (error) {
        console.error("Error creating addon:", error);
        res.status(500).json({ message: "Error creating addon", error });
    }
});

// Update Addon
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("addons_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const addon = await Addon.findById(req.params.id);
        if (!addon) {
            return res.status(404).json({ message: "Addon not found" });
        }

        if ('items' in req.body && !Array.isArray(req.body.items)) {
            return res.status(400).json({ message: "'items' should be an array" });
        }

        await addon.save();
        res.status(200).json({ message: "Addon updated successfully", addon });
    } catch (error) {
        console.error("Error updating addon:", error);
        res.status(500).json({ message: "Error updating addon", error });
    }
});

// Delete Addon
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("addons_delete") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const addon = await Addon.findById(req.params.id);
        if (!addon) {
            return res.status(404).json({ message: "Addon not found" });
        }

        await Addon.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Addon deleted successfully" });
    } catch (error) {
        console.error("Error deleting addon:", error);
        res.status(500).json({ message: "Error deleting addon", error });
    }
});

// Accessible Addons for staff
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        const addons = await Addon.find({
            brand_id: { $in: brands },
            outlet_id: { $in: outlets }
        })
            .populate("brand_id")
            .populate("outlet_id")
            .populate("menu_id")
            .populate("category_id")
            .populate("items");

        res.status(200).json({
            message: "Accessible addons fetched successfully",
            addons
        });
    } catch (error) {
        console.error("Error fetching accessible addons:", error);
        res.status(500).json({
            message: "Error fetching addons",
            error: error.message || error,
        });
    }
});

module.exports = router;
