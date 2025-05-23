const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { verifyToken } = require("../middleware/authMiddleware");

// Create Order
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brand_id, outlet_id, customer_id, order_type_id, items, subtotal, discount, extra_charge, total_amount, payment_status, payment_type_id, order_status, notes, table_id, floor_id } = req.body;

        // Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item." });
        }

        // Handle dine-in specific fields
        if (order_type_id.toString() === "dine-in" && (!table_id || !floor_id)) {
            return res.status(400).json({ message: "For dine-in orders, both table_id and floor_id must be provided." });
        }

        // Create new order
        const newOrder = new Order({
            brand_id,
            outlet_id,
            customer_id,
            order_type_id,
            items,
            subtotal,
            discount,
            extra_charge,
            total_amount,
            payment_status,
            payment_type_id,
            order_status,
            notes,
            table_id, // Only included for dine-in orders
            floor_id // Only included for dine-in orders
        });

        await newOrder.save();

        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Error creating order", error });
    }
});

// Update Order
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const { order_type_id, table_id, floor_id } = req.body;

        // Handle dine-in specific fields
        if (order_type_id && order_type_id.toString() === "dine-in") {
            if (!table_id || !floor_id) {
                return res.status(400).json({ message: "For dine-in orders, both table_id and floor_id must be provided." });
            }

            // Update table and floor for dine-in orders
            order.table_id = table_id;
            order.floor_id = floor_id;
        }

        // Update other fields
        Object.assign(order, req.body);

        await order.save();
        res.status(200).json({ message: "Order updated successfully", order });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Error updating order", error });
    }
});

// Delete Order
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_delete") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Error deleting order", error });
    }
});

// Fetch All Orders
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const orders = await Order.find()
            .populate("brand_id")
            .populate("outlet_id")
            .populate("customer_id")
            .populate("order_type_id")
            .populate("items.item_id")
            .populate("items.addons")
            .populate("payment_type_id")
            .populate("table_id") // Populate table information
            .populate("floor_id"); // Populate floor information

        res.status(200).json({ message: "Orders fetched successfully", orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders", error });
    }
});

// Fetch Orders accessible to the current staff
router.get("/accessible", verifyToken, async (req, res) => {
    // Check if the staff has 'orders_manage' permission
    if (!(req.staff?.permissions?.includes("orders_view"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brands, outlets } = req.staff;

        // Build the query for finding orders for the assigned brands and outlets
        const query = {
            brand_id: { $in: brands },
            outlet_id: { $in: outlets }
        };

        // Fetch orders, populate necessary fields, and optimize the query by using indexes
        const orders = await Order.find(query)
            .populate("brand_id")
            .populate("outlet_id")
            .populate("customer_id") // Populate customer details
            .populate("order_type_id") // Populate order type details
            .populate("payment_type_id") // Populate payment type details
            .populate("discount.discount_id") // Populate discount details
            .populate("extra_charge.charge_id") // Populate extra charge details
            .populate("items.item_id") // Populate item details
            .populate("items.addons") // Populate addon details if needed

        res.status(200).json({
            message: "Accessible orders fetched successfully",
            orders,
        });
    } catch (error) {
        console.error("Error fetching accessible orders:", error);
        res.status(500).json({
            message: "Error fetching orders",
            error: error.message || error,
        });
    }
});

// Fetch Single Order
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const order = await Order.findById(req.params.id)
            .populate("brand_id")
            .populate("outlet_id")
            .populate("customer_id")
            .populate("order_type_id")
            .populate("items.item_id")
            .populate("items.addons")
            .populate("payment_type_id")
            .populate("table_id") // Populate table information
            .populate("floor_id"); // Populate floor information

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order fetched successfully", order });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Error fetching order", error });
    }
});

// Update Order Status
router.put("/status/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("orders_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { order_status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update order status & timestamps
        order.order_status = order_status;
        if (order_status === "completed") order.completed_at = new Date();
        if (order_status === "cancelled") order.cancelled_at = new Date();

        await order.save();
        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Error updating order status", error });
    }
});

module.exports = router;
