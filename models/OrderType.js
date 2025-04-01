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
            enum: ["active", "inactive"], // Only allows "active" or "inactive"
            default: "active"
        },
        apply_on_all_outlets: {
            type: Boolean,
            default: false
        },
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },
        outlet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            required: function () {
                return !this.apply_on_all_outlets;
            }
        }
    },
    { timestamps: true }
);

// Ensures uniqueness of order type name per brand
OrderTypeSchema.index({ brand_id: 1, name: 1 }, { unique: true });

// Optimized indexes for faster queries
OrderTypeSchema.index({ brand_id: 1 });
OrderTypeSchema.index({ outlet_id: 1 });

module.exports = mongoose.model("OrderType", OrderTypeSchema);
