const express = require("express");
const router = express.Router();
const PaymentType = require("../models/PaymentType");
const { verifyToken } = require("../middleware/authMiddleware");


// Fetch PaymentTypes accessible to the current staff
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        console.log(brands)
        console.log(outlets)

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
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { payment_name, status, brand_id, outlet_id } = req.body;

        // Check if the payment type name already exists for the brand
        const existingPaymentType = await PaymentType.findOne({ payment_name, brand_id });
        if (existingPaymentType) {
            return res.status(400).json({ message: "Payment Type name already exists for this brand" });
        }

        // Create new payment type
        const newPaymentType = new PaymentType({
            payment_name,
            status,
            brand_id,
            outlet_id,
        });

        await newPaymentType.save();
        res.status(201).json({ message: "Payment Type created successfully", paymentType: newPaymentType });
    } catch (error) {
        console.error("Error creating payment type:", error);
        res.status(500).json({ message: "Error creating payment type", error });
    }
});

// Update PaymentType
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { payment_name, status, brand_id, outlet_id } = req.body;
        const paymentTypeId = req.params.id;

        // Check if the payment type exists
        const paymentType = await PaymentType.findById(paymentTypeId);
        if (!paymentType) {
            return res.status(404).json({ message: "Payment Type not found" });
        }

        // Update the payment type
        paymentType.payment_name = payment_name || paymentType.payment_name;
        paymentType.status = status || paymentType.status;
        paymentType.brand_id = brand_id || paymentType.brand_id;
        paymentType.outlet_id = outlet_id || paymentType.outlet_id;

        await paymentType.save();
        res.status(200).json({ message: "Payment Type updated successfully", paymentType });
    } catch (error) {
        console.error("Error updating payment type:", error);
        res.status(500).json({ message: "Error updating payment type", error });
    }
});

// Delete PaymentType
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const paymentTypeId = req.params.id;

        const paymentType = await PaymentType.findById(paymentTypeId);
        if (!paymentType) {
            return res.status(404).json({ message: "Payment Type not found" });
        }

        await PaymentType.findByIdAndDelete(paymentTypeId);
        res.status(200).json({ message: "Payment Type deleted successfully" });
    } catch (error) {
        console.error("Error deleting payment type:", error);
        res.status(500).json({ message: "Error deleting payment type", error });
    }
});

// Fetch PaymentTypes (list all)
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const paymentTypes = await PaymentType.find().populate("brand_id").populate("outlet_id");
        res.status(200).json({ message: "Payment Types fetched successfully", paymentTypes });
    } catch (error) {
        console.error("Error fetching payment types:", error);
        res.status(500).json({ message: "Error fetching payment types", error });
    }
});

// Fetch Single PaymentType
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const paymentTypeId = req.params.id;

        const paymentType = await PaymentType.findById(paymentTypeId).populate("brand_id").populate("outlet_id");
        if (!paymentType) {
            return res.status(404).json({ message: "Payment Type not found" });
        }

        res.status(200).json({ message: "Payment Type fetched successfully", paymentType });
    } catch (error) {
        console.error("Error fetching payment type:", error);
        res.status(500).json({ message: "Error fetching payment type", error });
    }
});

module.exports = router;
