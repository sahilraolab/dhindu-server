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
            required: false // made optional
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: false // made optional
        },
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item"
            }
        ],
        all_items: {
            type: Boolean,
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

// Index to ensure unique name per outlet
AddonSchema.index({ brand_id: 1, outlet_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Addon", AddonSchema);
