const mongoose = require("mongoose");

const PaymentTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        status: {
            type: String,
            enum: ["active", "inactive"], // Only allows "active" or "inactive"
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

// Unique payment name per brand
PaymentTypeSchema.index({ outlet_id: 1, name: 1 }, { unique: true });

// Optimize queries
PaymentTypeSchema.index({ brand_id: 1 });
PaymentTypeSchema.index({ outlet_id: 1 });

module.exports = mongoose.model("PaymentType", PaymentTypeSchema);
