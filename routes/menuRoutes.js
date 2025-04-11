const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const { verifyToken } = require("../middleware/authMiddleware");

// Fetch Menus accessible to the current staff
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        const menus = await Menu.find({
            brand_id: { $in: brands },
            outlet_id: { $in: outlets }
        }).populate("brand_id").populate("outlet_id");

        res.status(200).json({
            message: "Accessible menus fetched successfully",
            menus,
        });
    } catch (error) {
        console.error("Error fetching accessible menus:", error);
        res.status(500).json({
            message: "Error fetching menus",
            error: error.message || error,
        });
    }
});

// Create Menu
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const {
            brand_id,
            outlet_id,
            name,
            status,
            pos_menu,
            digital_menu,
            third_party_menu
        } = req.body;

        // Check for duplicate
        const existingMenu = await Menu.findOne({ brand_id, outlet_id, name });
        if (existingMenu) {
            return res.status(400).json({ message: "Menu with this name already exists for this outlet/brand." });
        }

        const newMenu = new Menu({
            brand_id,
            outlet_id,
            name,
            status,
            pos_menu,
            digital_menu,
            third_party_menu
        });

        await newMenu.save();

        res.status(201).json({
            message: "Menu created successfully",
            menu: newMenu
        });
    } catch (error) {
        console.error("Error creating menu:", error);
        res.status(500).json({ message: "Error creating menu", error: error.message || error });
    }
});

// Update Menu
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) {
            return res.status(404).json({ message: "Menu not found" });
        }

        const {
            brand_id,
            outlet_id,
            name
        } = req.body;

        // Check for duplicate
        const duplicate = await Menu.findOne({
            _id: { $ne: menu._id },
            brand_id: brand_id || menu.brand_id,
            outlet_id: outlet_id || menu.outlet_id,
            name: name || menu.name
        });

        if (duplicate) {
            return res.status(400).json({ message: "Another menu with the same name already exists." });
        }

        Object.assign(menu, req.body);
        await menu.save();

        res.status(200).json({
            message: "Menu updated successfully",
            menu
        });
    } catch (error) {
        console.error("Error updating menu:", error);
        res.status(500).json({ message: "Error updating menu", error: error.message || error });
    }
});

// Delete Menu
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("menus_delete"))) {
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
        res.status(500).json({ message: "Error deleting menu", error: error.message || error });
    }
});

// Fetch All Menus
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const menus = await Menu.find()
            .populate("brand_id")
            .populate("outlet_id");

        res.status(200).json({ message: "Menus fetched successfully", menus });
    } catch (error) {
        console.error("Error fetching menus:", error);
        res.status(500).json({ message: "Error fetching menus", error: error.message || error });
    }
});

// Fetch Single Menu
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const menu = await Menu.findById(req.params.id)
            .populate("brand_id")
            .populate("outlet_id");

        if (!menu) {
            return res.status(404).json({ message: "Menu not found" });
        }

        res.status(200).json({ message: "Menu fetched successfully", menu });
    } catch (error) {
        console.error("Error fetching menu:", error);
        res.status(500).json({ message: "Error fetching menu", error: error.message || error });
    }
});

module.exports = router;
