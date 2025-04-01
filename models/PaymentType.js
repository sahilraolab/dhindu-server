const mongoose = require("mongoose");

const PaymentTypeSchema = new mongoose.Schema(
    {
        payment_name: {
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

// Unique payment name per brand
PaymentTypeSchema.index({ brand_id: 1, payment_name: 1 }, { unique: true });

// Optimize queries
PaymentTypeSchema.index({ brand_id: 1 });
PaymentTypeSchema.index({ outlet_id: 1 });

module.exports = mongoose.model("PaymentType", PaymentTypeSchema);
