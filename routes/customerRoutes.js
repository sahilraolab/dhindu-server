const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const { verifyToken } = require("../middleware/authMiddleware");

// Upsert Customers (Bulk)
router.post("/upsert", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_edit"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    const { addedCustomers, brand_id, outlet_id } = req.body;

    const success = [];
    const failed = [];

    // Upsert added customers
    for (const customerData of addedCustomers) {
        try {
            const { name, email, country_code, phone, dob, anniversary_date, address = {}, status = "active" } = customerData;

            if (!name || name.length < 2) {
                failed.push({ data: customerData, error: "Customer name is required and must be at least 2 characters." });
                continue;
            }

            if (!email && !phone) {
                failed.push({ data: customerData, error: "Either email or phone must be provided." });
                continue;
            }

            const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{2}$/;
            if (dob && !dateRegex.test(dob)) {
                failed.push({ data: customerData, error: "Date of Birth must be in MM/DD/YY format." });
                continue;
            }
            if (anniversary_date && !dateRegex.test(anniversary_date)) {
                failed.push({ data: customerData, error: "Anniversary Date must be in MM/DD/YY format." });
                continue;
            }

            // Check for duplicates if email or phone are provided
            const duplicate = await Customer.findOne({
                brand_id,
                $or: [
                    email ? { email } : null,
                    phone ? { phone } : null
                ].filter(Boolean)
            });

            if (duplicate) {
                const conflictFields = [];
                if (duplicate.email === email) conflictFields.push("email");
                if (duplicate.phone === phone) conflictFields.push("phone");
                failed.push({ data: customerData, error: `Duplicate ${conflictFields.join(" and ")} found for this brand.` });
                continue;
            }


            const newCustomerData = {
                brand_id,
                outlet_id: outlet_id || null,
                name,
                email: email || undefined,
                phone: phone || undefined,
                country_code,
                dob: dob || "",
                anniversary_date: anniversary_date || "",
                address,
                status
            };

            const newCustomer = new Customer(newCustomerData);
            await newCustomer.save();
            success.push({ status: "created", customer: newCustomer });
        } catch (error) {
            failed.push({ data: customerData, error: error.message });
        }
    }

    res.status(200).json({
        message: "Customer bulk upsert complete",
        successCount: success.length,
        failedCount: failed.length,
        success,
        failed
    });
});

// Create Customer
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_edit"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brand_id, outlet_id, name, email, country_code, phone, dob, anniversary_date, address, order_history, status } = req.body;

        if (!brand_id || !name || name.length < 2) {
            return res.status(400).json({ message: "Brand ID and valid name are required." });
        }

        if (!email && !phone) {
            return res.status(400).json({ message: "Either email or phone must be provided." });
        }

        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{2}$/;
        if (dob && !dateRegex.test(dob)) {
            return res.status(400).json({ message: "Date of Birth must be in MM/DD/YY format." });
        }
        if (anniversary_date && !dateRegex.test(anniversary_date)) {
            return res.status(400).json({ message: "Anniversary Date must be in MM/DD/YY format." });
        }

        if (phone) {
            const existingPhoneCustomer = await Customer.findOne({ phone, brand_id });
            if (existingPhoneCustomer) {
                return res.status(400).json({ message: "Customer with this phone number already exists for this brand." });
            }
        }

        if (email) {
            const existingEmailCustomer = await Customer.findOne({ email, brand_id });
            if (existingEmailCustomer) {
                return res.status(400).json({ message: "Customer with this email already exists for this brand." });
            }
        }

        const newCustomer = new Customer({
            brand_id,
            outlet_id,
            name,
            email,
            country_code,
            phone,
            dob,
            anniversary_date,
            address,
            order_history,
            status
        });

        await newCustomer.save();

        const populatedCustomer = await Customer.findById(newCustomer._id)
            .populate("brand_id", "name")
            .populate("outlet_id", "name")
            .populate("order_history.order_id");

        res.status(201).json({ message: "Customer created successfully", customer: populatedCustomer });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: "Error creating customer", error: error.message });
    }
});

// Update Customer
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_edit"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const { name, email, country_code, phone, dob, anniversary_date, brand_id } = req.body;

        if (name && name.length < 2) {
            return res.status(400).json({ message: "Customer name must be at least 2 characters." });
        }

        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{2}$/;
        if (dob && !dateRegex.test(dob)) {
            return res.status(400).json({ message: "Date of Birth must be in MM/DD/YY format." });
        }
        if (anniversary_date && !dateRegex.test(anniversary_date)) {
            return res.status(400).json({ message: "Anniversary Date must be in MM/DD/YY format." });
        }

        const effectiveBrandId = brand_id || customer.brand_id;
        const newEmail = email !== undefined ? email : customer.email;
        const newPhone = phone !== undefined ? phone : customer.phone;

        if (!newEmail && !newPhone) {
            return res.status(400).json({ message: "Either email or phone must be provided." });
        }

        if (!country_code) {
            return res.status(400).json({ message: "Country code is required." });
        }

        if (phone && phone !== customer.phone) {
            const existingPhoneCustomer = await Customer.findOne({ phone, brand_id: effectiveBrandId });
            if (existingPhoneCustomer) {
                return res.status(400).json({ message: "Another customer with this phone already exists for this brand." });
            }
        }

        if (email && email !== customer.email) {
            const existingEmailCustomer = await Customer.findOne({ email, brand_id: effectiveBrandId });
            if (existingEmailCustomer) {
                return res.status(400).json({ message: "Another customer with this email already exists for this brand." });
            }
        }

        Object.assign(customer, req.body);
        await customer.save();

        const populatedCustomer = await Customer.findById(customer._id)
            .populate("brand_id", "name")
            .populate("outlet_id", "name")
            .populate("order_history.order_id");

        res.status(200).json({ message: "Customer updated successfully", customer: populatedCustomer });
    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ message: "Error updating customer", error: error.message });
    }
});

// Fetch Accessible Customers
router.get("/accessible", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        const customers = await Customer.find({
            brand_id: { $in: brands },
            $or: [
                { outlet_id: { $in: outlets } },
                { outlet_id: { $exists: false } },
                { outlet_id: null }
            ]
        }).populate("brand_id outlet_id");

        res.status(200).json({ message: "Accessible customers fetched successfully", customers });
    } catch (error) {
        console.error("Error fetching accessible customers:", error);
        res.status(500).json({ message: "Error fetching customers", error });
    }
});

// Delete Customer
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_delete"))) {
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
        res.status(500).json({ message: "Error deleting customer", error: error.message });
    }
});

// Fetch All Customers
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_view"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const customers = await Customer.find()
            .populate("brand_id", "name")
            .populate("outlet_id", "name")
            .populate("order_history.order_id");

        res.status(200).json({ message: "Customers fetched successfully", customers });
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: "Error fetching customers", error: error.message });
    }
});

// Fetch Single Customer
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("customers_view"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const customer = await Customer.findById(req.params.id)
            .populate("brand_id", "name")
            .populate("outlet_id", "name")
            .populate("order_history.order_id");

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.status(200).json({ message: "Customer fetched successfully", customer });
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ message: "Error fetching customer", error: error.message });
    }
});

module.exports = router;
