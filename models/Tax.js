const mongoose = require("mongoose");

const TaxSchema = new mongoose.Schema(
    {
        tax_name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        tax_value: {
            type: Number,
            required: true,
            min: 0,
            max: 100 // Assuming tax percentage (adjust if needed)
        },
        display_tax_name: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["active", "inactive"], // Ensures consistent values
            default: "active"
        },
        apply_tax_on_all_outlets: {
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
                return !this.apply_tax_on_all_outlets;
            }
        }
    },
    { timestamps: true }
);

// **Indexes for performance & uniqueness**
TaxSchema.index({ brand_id: 1, tax_name: 1 }, { unique: true }); // Ensures unique tax names per brand
TaxSchema.index({ brand_id: 1 });
TaxSchema.index({ outlet_id: 1 });

module.exports = mongoose.model("Tax", TaxSchema);
