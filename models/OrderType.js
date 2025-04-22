const mongoose = require("mongoose");

const OrderTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        category: {
            type: String,
            enum: ["pickup", "dine-in", "quick-service", "delivery", "third-party"],
            required: true
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },
        outlet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            required: true
        }
    },
    { timestamps: true }
);

OrderTypeSchema.index({ outlet_id: 1, category: 1, name: 1 }, { unique: true });


// Optimized indexes for faster queries
OrderTypeSchema.index({ brand_id: 1 });
OrderTypeSchema.index({ outlet_id: 1 });

module.exports = mongoose.model("OrderType", OrderTypeSchema);
