const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema(
    {
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },
        apply_on_all_outlets: {
            type: Boolean,
            default: false
        },
        outlet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            required: function () {
                return !this.apply_on_all_outlets; // Required if NOT applying to all outlets
            }
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        apply_on_all_order_types: {
            type: Boolean,
            default: false
        },
        order_types: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "OrderType",
                required: function () {
                    return !this.apply_on_all_order_types; // Required if NOT applying to all order types
                }
            }
        ]
    },
    { timestamps: true }
);

// **Indexes for optimized queries & uniqueness**
MenuSchema.index(
    { brand_id: 1, outlet_id: 1, name: 1 },
    { unique: true, partialFilterExpression: { apply_on_all_outlets: false } }
);
MenuSchema.index(
    { brand_id: 1, name: 1 },
    { unique: true, partialFilterExpression: { apply_on_all_outlets: true } }
);

module.exports = mongoose.model("Menu", MenuSchema);
