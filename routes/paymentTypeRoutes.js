const express = require("express");
const router = express.Router();
const PaymentType = require("../models/PaymentType");
const { verifyToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
    createPaymentTypeValidator,
    updatePaymentTypeValidator
} = require("../validators/paymentTypeValidator");

// Fetch accessible PaymentTypes
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        const paymentTypes = await PaymentType.find({
            brand_id: { $in: brands },
            outlet_id: { $in: outlets }
        }).populate("brand_id").populate("outlet_id");

        res.status(200).json({
            message: "Accessible payment types fetched successfully",
            paymentTypes,
        });
    } catch (error) {
        console.error("Error fetching accessible payment types:", error);
        res.status(500).json({
            message: "Error fetching payment types",
            error: error.message || error,
        });
    }
});

// Create PaymentType
router.post(
    "/create",
    verifyToken,
    createPaymentTypeValidator,
    validateRequest,
    async (req, res) => {
        if (!(req.staff?.permissions?.includes("settings_manage"))) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        try {
            const { name, status, brand_id, outlet_id } = req.body;

            const existing = await PaymentType.findOne({ name, outlet_id });
            if (existing) {
                return res.status(400).json({ message: "Payment Type name already exists for this Outlet" });
            }

            const newPaymentType = new PaymentType({ name, status, brand_id, outlet_id });
            await newPaymentType.save();

            res.status(201).json({ message: "Payment Type created successfully", paymentType: newPaymentType });
        } catch (error) {
            console.error("Error creating payment type:", error);
            res.status(500).json({ message: "Error creating payment type", error });
        }
    }
);

// Update PaymentType
router.put(
    "/update/:id",
    verifyToken,
    updatePaymentTypeValidator,
    validateRequest,
    async (req, res) => {
        if (!(req.staff?.permissions?.includes("settings_manage"))) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        try {
            const { name, status, brand_id, outlet_id } = req.body;
            const paymentTypeId = req.params.id;

            const paymentType = await PaymentType.findById(paymentTypeId);
            if (!paymentType) {
                return res.status(404).json({ message: "Payment Type not found" });
            }

            // Check for uniqueness if name is being updated
            if (name && name !== paymentType.name) {
                const duplicate = await PaymentType.findOne({ name, brand_id: brand_id || paymentType.brand_id });
                if (duplicate) {
                    return res.status(400).json({ message: "Payment Type name already exists for this brand" });
                }
            }

            // Update fields
            paymentType.name = name ?? paymentType.name;
            paymentType.status = status ?? paymentType.status;
            paymentType.brand_id = brand_id ?? paymentType.brand_id;
            paymentType.outlet_id = outlet_id ?? paymentType.outlet_id;

            await paymentType.save();
            res.status(200).json({ message: "Payment Type updated successfully", paymentType });
        } catch (error) {
            console.error("Error updating payment type:", error);
            res.status(500).json({ message: "Error updating payment type", error });
        }
    }
);

module.exports = router;
