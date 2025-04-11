const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const { verifyToken } = require("../middleware/authMiddleware");

// Create Item
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("items_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { menu_id, brand_id, apply_on_all_outlets, outlet_id, category_id, name, description, price, food_type, status, apply_on_all_order_types, order_types, addons, images } = req.body;

        // Check for existing item
        const existingItem = await Item.findOne({ menu_id, brand_id, name });
        if (existingItem) {
            return res.status(400).json({ message: "Item with this name already exists for this menu and brand." });
        }

        // Create new item
        const newItem = new Item({ menu_id, brand_id, apply_on_all_outlets, outlet_id, category_id, name, description, price, food_type, status, apply_on_all_order_types, order_types, addons, images });
        await newItem.save();

        res.status(201).json({ message: "Item created successfully", item: newItem });
    } catch (error) {
        console.error("Error creating item:", error);
        res.status(500).json({ message: "Error creating item", error });
    }
});

// Update Item
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("items_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        Object.assign(item, req.body);
        await item.save();
        res.status(200).json({ message: "Item updated successfully", item });
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ message: "Error updating item", error });
    }
});

// Delete Item
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("items_delete") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ message: "Error deleting item", error });
    }
});

// Fetch items by menu_id with populated category (_id and name only)
router.get("/menu/:menu_id", verifyToken, async (req, res) => {
    try {
        const { menu_id } = req.params;

        const items = await Item.find({ menu_id })
            .populate({
                path: "category_id",
                select: "_id name"
            });

        res.status(200).json({
            message: "Items fetched successfully",
            items
        });
    } catch (error) {
        console.error("Error fetching items by menu ID:", error);
        res.status(500).json({ message: "Error fetching items", error });
    }
});

module.exports = router;
