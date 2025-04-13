const express = require("express");
const router = express.Router();
const OrderType = require("../models/OrderType");
const { verifyToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { orderTypeValidationRules } = require("../validators/orderTypeValidator");

// Fetch OrderTypes accessible to the current staff
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        const orderTypes = await OrderType.find({
            brand_id: { $in: brands },
            outlet_id: { $in: outlets }
        }).populate("brand_id").populate("outlet_id");

        res.status(200).json({
            message: "Accessible order types fetched successfully",
            orderTypes,
        });
    } catch (error) {
        console.error("Error fetching accessible order types:", error);
        res.status(500).json({
            message: "Error fetching order types",
            error: error.message || error,
        });
    }
});

// Create OrderType
router.post(
    "/create",
    verifyToken,
    orderTypeValidationRules,
    validateRequest,
    async (req, res) => {
        if (!(req.staff?.permissions?.includes("orders_edit") || req.staff?.role === "admin")) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        try {
            const { name, category, status, brand_id, outlet_id } = req.body;

            const existingOrderType = await OrderType.findOne({ name, brand_id });
            if (existingOrderType) {
                return res.status(400).json({ message: "Order Type name already exists for this brand" });
            }

            const newOrderType = new OrderType({ name, category, status, brand_id, outlet_id });
            await newOrderType.save();

            res.status(201).json({ message: "Order Type created successfully", orderType: newOrderType });
        } catch (error) {
            console.error("Error creating order type:", error);
            res.status(500).json({ message: "Error creating order type", error });
        }
    }
);

// Update OrderType
router.put(
    "/update/:id",
    verifyToken,
    orderTypeValidationRules,
    validateRequest,
    async (req, res) => {
        if (!(req.staff?.permissions?.includes("orders_edit") || req.staff?.role === "admin")) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        try {
            const orderTypeId = req.params.id;
            const { name, category, status, brand_id, outlet_id } = req.body;

            const orderType = await OrderType.findById(orderTypeId);
            if (!orderType) {
                return res.status(404).json({ message: "Order Type not found" });
            }

            // Check for duplicate name in the same brand (only if name/brand changed)
            if ((name && name !== orderType.name) || (brand_id && brand_id !== orderType.brand_id.toString())) {
                const duplicate = await OrderType.findOne({ name, brand_id });
                if (duplicate && duplicate._id.toString() !== orderTypeId) {
                    return res.status(400).json({ message: "Order Type name already exists for this brand" });
                }
            }

            orderType.name = name || orderType.name;
            orderType.category = category || orderType.category;
            orderType.status = status || orderType.status;
            orderType.brand_id = brand_id || orderType.brand_id;
            orderType.outlet_id = outlet_id || orderType.outlet_id;

            await orderType.save();
            res.status(200).json({ message: "Order Type updated successfully", orderType });
        } catch (error) {
            console.error("Error updating order type:", error);
            res.status(500).json({ message: "Error updating order type", error });
        }
    }
);

module.exports = router;
