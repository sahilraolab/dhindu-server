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

            // Step 1: Fetch all order types for the specific outlet
            const outletOrderTypes = await OrderType.find({ outlet_id });

            // Step 2: Check if this category already exists for this outlet
            const categoryExists = outletOrderTypes.some(
                (orderType) => orderType.category.toLowerCase() === category.toLowerCase()
            );
            if (categoryExists) {
                return res.status(400).json({
                    message: "This category already exists for the selected outlet",
                });
            }

            // Step 3: Check if this name is already used in any order type of the same outlet
            const nameExists = outletOrderTypes.some(
                (orderType) => orderType.name.toLowerCase() === name.toLowerCase()
            );
            if (nameExists) {
                return res.status(400).json({
                    message: "This name is already used for another order type in the outlet",
                });
            }

            // Step 4: Proceed with creation
            const newOrderType = new OrderType({ name, category, status, brand_id, outlet_id });
            await newOrderType.save();

            const populatedOrderType = await OrderType.findById(newOrderType._id)
                .populate("brand_id")
                .populate("outlet_id");

            res.status(201).json({ message: "Order Type created successfully", orderType: populatedOrderType });
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

            // Fetch all order types for the given outlet
            const outletOrderTypes = await OrderType.find({ outlet_id });

            // Step 1: Check if the category already exists for the outlet
            const categoryExists = outletOrderTypes.some(
                (orderType) => orderType.category.toLowerCase() === category.toLowerCase() && orderType._id.toString() !== orderTypeId
            );
            if (categoryExists) {
                return res.status(400).json({
                    message: "This category already exists for the selected outlet",
                });
            }

            // Step 2: Check if the name already exists for this outlet
            const nameExists = outletOrderTypes.some(
                (orderType) => orderType.name.toLowerCase() === name.toLowerCase() && orderType._id.toString() !== orderTypeId
            );
            if (nameExists) {
                return res.status(400).json({
                    message: "This name is already used for another order type in the outlet",
                });
            }

            // Step 3: Proceed with updating the order type
            orderType.name = name || orderType.name;
            orderType.category = category || orderType.category;
            orderType.status = status || orderType.status;
            orderType.brand_id = brand_id || orderType.brand_id;
            orderType.outlet_id = outlet_id || orderType.outlet_id;

            await orderType.save();

            const populatedOrderType = await OrderType.findById(orderType._id)
                .populate("brand_id")
                .populate("outlet_id");

            res.status(200).json({ message: "Order Type updated successfully", orderType: populatedOrderType });
        } catch (error) {
            console.error("Error updating order type:", error);
            res.status(500).json({ message: "Error updating order type", error });
        }
    }
);

// Fetch OrderTypes by brand_id and outlet_id
router.get("/by-brand-outlet", verifyToken, async (req, res) => {
    const { brand_id, outlet_id } = req.query;

    if (!brand_id || !outlet_id) {
        return res.status(400).json({ message: "brand_id and outlet_id are required." });
    }

    if (!(req.staff?.permissions?.includes("orders_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const orderTypes = await OrderType.find({ brand_id, outlet_id })
            .populate("brand_id")
            .populate("outlet_id");

        res.status(200).json({
            message: "Order types fetched successfully",
            orderTypes,
        });
    } catch (error) {
        console.error("Error fetching order types by brand and outlet:", error);
        res.status(500).json({
            message: "Error fetching order types",
            error: error.message || error,
        });
    }
});


module.exports = router;
