const express = require("express");
const router = express.Router();
const OrderType = require("../models/OrderType");
const verifyToken = require("../middlewares/verifyToken");

// Create OrderType
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { name, category, status, apply_on_all_outlets, brand_id, outlet_id } = req.body;

        // Check if the order type name already exists for the brand
        const existingOrderType = await OrderType.findOne({ name, brand_id });
        if (existingOrderType) {
            return res.status(400).json({ message: "Order Type name already exists for this brand" });
        }

        // Create new order type
        const newOrderType = new OrderType({
            name,
            category,
            status,
            apply_on_all_outlets,
            brand_id,
            outlet_id,
        });

        await newOrderType.save();
        res.status(201).json({ message: "Order Type created successfully", orderType: newOrderType });
    } catch (error) {
        console.error("Error creating order type:", error);
        res.status(500).json({ message: "Error creating order type", error });
    }
});

// Update OrderType
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { name, category, status, apply_on_all_outlets, brand_id, outlet_id } = req.body;
        const orderTypeId = req.params.id;

        // Check if the order type exists
        const orderType = await OrderType.findById(orderTypeId);
        if (!orderType) {
            return res.status(404).json({ message: "Order Type not found" });
        }

        // Update the order type
        orderType.name = name || orderType.name;
        orderType.category = category || orderType.category;
        orderType.status = status || orderType.status;
        orderType.apply_on_all_outlets = apply_on_all_outlets || orderType.apply_on_all_outlets;
        orderType.brand_id = brand_id || orderType.brand_id;
        orderType.outlet_id = outlet_id || orderType.outlet_id;

        await orderType.save();
        res.status(200).json({ message: "Order Type updated successfully", orderType });
    } catch (error) {
        console.error("Error updating order type:", error);
        res.status(500).json({ message: "Error updating order type", error });
    }
});

// Delete OrderType
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_delete") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const orderTypeId = req.params.id;

        // Check if the order type exists
        const orderType = await OrderType.findById(orderTypeId);
        if (!orderType) {
            return res.status(404).json({ message: "Order Type not found" });
        }

        // Delete the order type
        await OrderType.findByIdAndDelete(orderTypeId);
        res.status(200).json({ message: "Order Type deleted successfully" });
    } catch (error) {
        console.error("Error deleting order type:", error);
        res.status(500).json({ message: "Error deleting order type", error });
    }
});

// Fetch OrderTypes (list all)
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const orderTypes = await OrderType.find().populate("brand_id").populate("outlet_id");
        res.status(200).json({ message: "Order Types fetched successfully", orderTypes });
    } catch (error) {
        console.error("Error fetching order types:", error);
        res.status(500).json({ message: "Error fetching order types", error });
    }
});

// Fetch Single OrderType
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const orderTypeId = req.params.id;

        // Check if the order type exists
        const orderType = await OrderType.findById(orderTypeId).populate("brand_id").populate("outlet_id");
        if (!orderType) {
            return res.status(404).json({ message: "Order Type not found" });
        }

        res.status(200).json({ message: "Order Type fetched successfully", orderType });
    } catch (error) {
        console.error("Error fetching order type:", error);
        res.status(500).json({ message: "Error fetching order type", error });
    }
});

module.exports = router;
