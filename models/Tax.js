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
            max: 100 // Assuming tax percentage
        },
        display_tax_name: {
            type: String,
            required: true,
            trim: true
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

// **Indexes for performance & uniqueness**
TaxSchema.index({ brand_id: 1 });
TaxSchema.index({ outlet_id: 1 }, { unique: true });  // Ensure only one tax per outlet

module.exports = mongoose.model("Tax", TaxSchema);
