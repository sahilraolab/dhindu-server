const express = require("express");
const router = express.Router();
const Tax = require("../models/Tax");
const { verifyToken } = require("../middleware/authMiddleware");

// Fetch Taxes for current staff's brands & outlets
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        const taxes = await Tax.find({
            brand_id: { $in: brands },
            outlet_id: { $in: outlets }
        }).populate("brand_id").populate("outlet_id");

        res.status(200).json({
            message: "Accessible taxes fetched successfully",
            taxes,
        });
    } catch (error) {
        console.error("Error fetching accessible taxes:", error);
        res.status(500).json({
            message: "Error fetching taxes",
            error: error.message || error,
        });
    }
});

// Create Tax
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { tax_name, tax_value, display_tax_name, status, brand_id, outlet_id } = req.body;

        const existingTax = await Tax.findOne({ tax_name, brand_id });
        if (existingTax) {
            return res.status(400).json({ message: "Tax name already exists for this brand" });
        }

        const newTax = new Tax({
            tax_name,
            tax_value,
            display_tax_name,
            status,
            brand_id,
            outlet_id
        });

        await newTax.save();
        res.status(201).json({ message: "Tax created successfully", tax: newTax });
    } catch (error) {
        console.error("Error creating tax:", error);
        res.status(500).json({ message: "Error creating tax", error });
    }
});

// Update Tax
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { tax_name, tax_value, display_tax_name, status, brand_id, outlet_id } = req.body;
        const taxId = req.params.id;

        const tax = await Tax.findById(taxId);
        if (!tax) {
            return res.status(404).json({ message: "Tax not found" });
        }

        tax.tax_name = tax_name;
        tax.tax_value = tax_value;
        tax.display_tax_name = display_tax_name;
        tax.status = status;
        tax.brand_id = brand_id;
        tax.outlet_id = outlet_id;

        await tax.save();
        res.status(200).json({ message: "Tax updated successfully", tax });
    } catch (error) {
        console.error("Error updating tax:", error);
        res.status(500).json({ message: "Error updating tax", error });
    }
});

// Delete Tax
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const taxId = req.params.id;

        const tax = await Tax.findById(taxId);
        if (!tax) {
            return res.status(404).json({ message: "Tax not found" });
        }

        await Tax.findByIdAndDelete(taxId);
        res.status(200).json({ message: "Tax deleted successfully" });
    } catch (error) {
        console.error("Error deleting tax:", error);
        res.status(500).json({ message: "Error deleting tax", error });
    }
});

// Fetch All Taxes
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const taxes = await Tax.find().populate("brand_id").populate("outlet_id");
        res.status(200).json({ message: "Taxes fetched successfully", taxes });
    } catch (error) {
        console.error("Error fetching taxes:", error);
        res.status(500).json({ message: "Error fetching taxes", error });
    }
});

// Fetch Single Tax
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const taxId = req.params.id;

        const tax = await Tax.findById(taxId).populate("brand_id").populate("outlet_id");
        if (!tax) {
            return res.status(404).json({ message: "Tax not found" });
        }

        res.status(200).json({ message: "Tax fetched successfully", tax });
    } catch (error) {
        console.error("Error fetching tax:", error);
        res.status(500).json({ message: "Error fetching tax", error });
    }
});

module.exports = router;
