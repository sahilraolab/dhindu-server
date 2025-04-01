const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const verifyToken = require("../middlewares/verifyToken");

// Create Customer
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brand_id, outlet_id, first_name, last_name, email, phone, dob, anniversary_date, address, order_history, status } = req.body;

        // Check for existing customer with the same phone number for the brand
        const existingCustomer = await Customer.findOne({ phone, brand_id });
        if (existingCustomer) {
            return res.status(400).json({ message: "Customer with this phone number already exists for this brand." });
        }

        // Create new customer
        const newCustomer = new Customer({ brand_id, outlet_id, first_name, last_name, email, phone, dob, anniversary_date, address, order_history, status });
        await newCustomer.save();

        res.status(201).json({ message: "Customer created successfully", customer: newCustomer });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: "Error creating customer", error });
    }
});

// Update Customer
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        Object.assign(customer, req.body); // Update fields
        await customer.save();
        res.status(200).json({ message: "Customer updated successfully", customer });
    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ message: "Error updating customer", error });
    }
});

// Delete Customer
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_delete") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        await Customer.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ message: "Error deleting customer", error });
    }
});

// Fetch All Customers
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const customers = await Customer.find()
            .populate("brand_id")
            .populate("outlet_id")
            .populate("order_history.order_id");

        res.status(200).json({ message: "Customers fetched successfully", customers });
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: "Error fetching customers", error });
    }
});

// Fetch Single Customer
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const customer = await Customer.findById(req.params.id)
            .populate("brand_id")
            .populate("outlet_id")
            .populate("order_history.order_id");

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.status(200).json({ message: "Customer fetched successfully", customer });
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ message: "Error fetching customer", error });
    }
});

module.exports = router;
