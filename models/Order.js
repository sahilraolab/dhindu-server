const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
    {
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },
        outlet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            required: true
        },
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: false // Guest checkout allowed
        },
        order_type_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderType",
            required: true
        },
        items: [
            {
                item_id: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true, min: 0 },
                addons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Addon" }]
            }
        ],
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        discount: {
            discount_id: { type: mongoose.Schema.Types.ObjectId, ref: "Discount", required: false },
            amount: { type: Number, min: 0, default: 0 }
        },
        extra_charge: {
            charge_id: { type: mongoose.Schema.Types.ObjectId, ref: "ExtraCharge", required: false },
            amount: { type: Number, min: 0, default: 0 }
        },
        total_amount: {
            type: Number,
            required: true,
            min: 0
        },
        payment_status: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },
        payment_type_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PaymentType",
            required: true
        },
        order_status: {
            type: String,
            enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
            default: "pending"
        },
        placed_at: {
            type: Date,
            default: Date.now
        },
        completed_at: {
            type: Date
        },
        cancelled_at: {
            type: Date
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500
        },
        // New fields for dine-in orders
        table_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: function () {
                return this.order_type_id.toString() === "dine-in"; // Only required if the order type is "dine-in"
            }
        },
        floor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Floor",
            required: function () {
                return this.order_type_id.toString() === "dine-in"; // Only required if the order type is "dine-in"
            }
        }
    },
    { timestamps: true }
);

// **Indexes for Optimized Queries**
OrderSchema.index({ brand_id: 1, outlet_id: 1, customer_id: 1, order_status: 1 });

module.exports = mongoose.model("Order", OrderSchema);
