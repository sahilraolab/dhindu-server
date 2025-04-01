const express = require("express");
const router = express.Router();
const Discount = require("../models/Discount");
const verifyToken = require("../middlewares/verifyToken");

// Create Discount
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("discounts_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const {
            brand_id,
            outlet_id,
            apply_on_all_outlets,
            name,
            apply_on_all_order_types,
            order_types,
            rate,
            type,
            apply_on_all_menus,
            menus,
            apply_on_all_categories,
            categories,
            apply_on_all_items,
            items,
            day,
            start_time,
            end_time,
            status,
            is_coupon,
            coupon_code,
            is_extra_charge,
        } = req.body;

        // Check if the discount name already exists for the brand and outlet
        const existingDiscount = await Discount.findOne({ brand_id, outlet_id, name, day });
        if (existingDiscount) {
            return res.status(400).json({ message: "Discount already exists for this brand and outlet on this day" });
        }

        // Create new discount
        const newDiscount = new Discount({
            brand_id,
            outlet_id,
            apply_on_all_outlets,
            name,
            apply_on_all_order_types,
            order_types,
            rate,
            type,
            apply_on_all_menus,
            menus,
            apply_on_all_categories,
            categories,
            apply_on_all_items,
            items,
            day,
            start_time,
            end_time,
            status,
            is_coupon,
            coupon_code,
            is_extra_charge,
        });

        await newDiscount.save();
        res.status(201).json({ message: "Discount created successfully", discount: newDiscount });
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
        const {
            brand_id,
            outlet_id,
            apply_on_all_outlets,
            name,
            apply_on_all_order_types,
            order_types,
            rate,
            type,
            apply_on_all_menus,
            menus,
            apply_on_all_categories,
            categories,
            apply_on_all_items,
            items,
            day,
            start_time,
            end_time,
            status,
            is_coupon,
            coupon_code,
            is_extra_charge,
        } = req.body;
        const discountId = req.params.id;

        // Check if the discount exists
        const discount = await Discount.findById(discountId);
        if (!discount) {
            return res.status(404).json({ message: "Discount not found" });
        }

        // Update the discount
        discount.brand_id = brand_id || discount.brand_id;
        discount.outlet_id = outlet_id || discount.outlet_id;
        discount.apply_on_all_outlets = apply_on_all_outlets || discount.apply_on_all_outlets;
        discount.name = name || discount.name;
        discount.apply_on_all_order_types = apply_on_all_order_types || discount.apply_on_all_order_types;
        discount.order_types = order_types || discount.order_types;
        discount.rate = rate || discount.rate;
        discount.type = type || discount.type;
        discount.apply_on_all_menus = apply_on_all_menus || discount.apply_on_all_menus;
        discount.menus = menus || discount.menus;
        discount.apply_on_all_categories = apply_on_all_categories || discount.apply_on_all_categories;
        discount.categories = categories || discount.categories;
        discount.apply_on_all_items = apply_on_all_items || discount.apply_on_all_items;
        discount.items = items || discount.items;
        discount.day = day || discount.day;
        discount.start_time = start_time || discount.start_time;
        discount.end_time = end_time || discount.end_time;
        discount.status = status || discount.status;
        discount.is_coupon = is_coupon || discount.is_coupon;
        discount.coupon_code = coupon_code || discount.coupon_code;
        discount.is_extra_charge = is_extra_charge || discount.is_extra_charge;

        await discount.save();
        res.status(200).json({ message: "Discount updated successfully", discount });
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
        const discountId = req.params.id;

        // Check if the discount exists
        const discount = await Discount.findById(discountId);
        if (!discount) {
            return res.status(404).json({ message: "Discount not found" });
        }

        // Delete the discount
        await Discount.findByIdAndDelete(discountId);
        res.status(200).json({ message: "Discount deleted successfully" });
    } catch (error) {
        console.error("Error deleting discount:", error);
        res.status(500).json({ message: "Error deleting discount", error });
    }
});

// Fetch All Discounts
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("discounts_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const discounts = await Discount.find().populate("brand_id").populate("outlet_id").populate("order_types").populate("menus").populate("categories").populate("items");
        res.status(200).json({ message: "Discounts fetched successfully", discounts });
    } catch (error) {
        console.error("Error fetching discounts:", error);
        res.status(500).json({ message: "Error fetching discounts", error });
    }
});

// Fetch Single Discount
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("discounts_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const discountId = req.params.id;

        // Check if the discount exists
        const discount = await Discount.findById(discountId)
            .populate("brand_id")
            .populate("outlet_id")
            .populate("order_types")
            .populate("menus")
            .populate("categories")
            .populate("items");

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
