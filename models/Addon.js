const mongoose = require("mongoose");

const AddonSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
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
        },
        menu_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: false,
            default: null
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: false,
            default: null
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: false,
            default: null
        },
        all_items: {
            type: Boolean,
            required: false,
            default: false
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    { timestamps: true }
);

// 👇 Index for unique name per outlet
AddonSchema.index({ outlet_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Addon", AddonSchema);
