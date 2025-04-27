const express = require("express");
const router = express.Router();
const Discount = require("../models/Discount");
const { verifyToken } = require("../middleware/authMiddleware");

// Create Discount
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const {
            brand_id,
            outlet_id,
            name,
            apply_type,
            apply_on_all_order_types,
            order_type,
            rate,
            type,
            apply_on_all_menus,
            menu,
            apply_on_all_categories,
            category,
            apply_on_all_items,
            item,
            day,
            start_time,
            end_time,
            code,
            status
        } = req.body;

        const existingDiscount = await Discount.findOne({ brand_id, outlet_id, name, day });
        if (existingDiscount) {
            return res.status(400).json({ message: "Discount already exists for this brand and outlet on this day" });
        }

        const newDiscount = new Discount({
            brand_id,
            outlet_id,
            name,
            apply_type,
            apply_on_all_order_types,
            order_type,
            rate,
            type,
            apply_on_all_menus,
            menu,
            apply_on_all_categories,
            category,
            apply_on_all_items,
            item,
            day,
            start_time,
            end_time,
            code,
            status
        });

        await newDiscount.save();

        const populatedDiscount = await Discount.findById(newDiscount._id)
            .populate("brand_id outlet_id order_type menu category item");

        res.status(201).json({ message: "Discount created successfully", discount: populatedDiscount });
    } catch (error) {
        console.error("Error creating discount:", error);
        res.status(500).json({ message: "Error creating discount", error });
    }
});

// Update Discount
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("discounts_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) {
            return res.status(404).json({ message: "Discount not found" });
        }

        const fields = [
            "brand_id", "outlet_id", "name", "apply_type",
            "apply_on_all_order_types", "order_type", "rate", "type",
            "apply_on_all_menus", "menu", "apply_on_all_categories", "category",
            "apply_on_all_items", "item", "day", "start_time", "end_time", "code", "status"
        ];

        for (const field of fields) {
            if (req.body.hasOwnProperty(field)) {
                discount[field] = req.body[field];
            }
        }

        await discount.save();

        const populatedDiscount = await Discount.findById(discount._id)
            .populate("brand_id outlet_id order_type menu category item");

        res.status(200).json({ message: "Discount updated successfully", discount: populatedDiscount });
    } catch (error) {
        console.error("Error updating discount:", error);
        res.status(500).json({ message: "Error updating discount", error });
    }
});

// Delete Discount
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("discounts_delete") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) {
            return res.status(404).json({ message: "Discount not found" });
        }

        await Discount.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Discount deleted successfully" });
    } catch (error) {
        console.error("Error deleting discount:", error);
        res.status(500).json({ message: "Error deleting discount", error });
    }
});

// Accessible Discounts
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        const discounts = await Discount.find({
            brand_id: { $in: brands },
            outlet_id: { $in: outlets }
        }).populate("brand_id outlet_id order_type menu category item");

        res.status(200).json({ message: "Accessible discounts fetched successfully", discounts });
    } catch (error) {
        console.error("Error fetching accessible discounts:", error);
        res.status(500).json({ message: "Error fetching discounts", error });
    }
});

// All Discounts
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("discounts_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const discounts = await Discount.find()
            .populate("brand_id outlet_id order_type menu category item");

        res.status(200).json({ message: "Discounts fetched successfully", discounts });
    } catch (error) {
        console.error("Error fetching discounts:", error);
        res.status(500).json({ message: "Error fetching discounts", error });
    }
});

// Single Discount
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("discounts_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const discount = await Discount.findById(req.params.id)
            .populate("brand_id outlet_id order_type menu category item");

        if (!discount) {
            return res.status(404).json({ message: "Discount not found" });
        }

        res.status(200).json({ message: "Discount fetched successfully", discount });
    } catch (error) {
        console.error("Error fetching discount:", error);
        res.status(500).json({ message: "Error fetching discount", error });
    }
});

module.exports = router;
