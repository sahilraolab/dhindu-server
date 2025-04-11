const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema(
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
        pos_menu: {
            type: Boolean,
            default: false,
            required: true
        },
        digital_menu: {
            type: Boolean,
            default: false,
            required: true
        },
        third_party_menu: {
            type: Boolean,
            default: false,
            required: true
        },
    },
    { timestamps: true }
);

// **Index for optimized queries & uniqueness**
MenuSchema.index(
    { brand_id: 1, outlet_id: 1, name: 1 },
    { unique: true }
);

module.exports = mongoose.model("Menu", MenuSchema);
