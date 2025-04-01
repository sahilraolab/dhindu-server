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
            required: function () {
                return !this.all_outlets; // Required if NOT applying to all outlets
            }
        },
        menu_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: function () {
                return !this.all_menus; // Required if NOT applying to all menus
            }
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: function () {
                return !this.all_categories; // Required if NOT applying to all categories
            }
        },
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
                required: function () {
                    return !this.all_items; // Required if NOT applying to all items
                }
            }
        ],
        price: {
            type: Number,
            required: true,
            min: 0 // Price cannot be negative
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        all_items: {
            type: Boolean,
            default: false // If true, applies to all items
        },
        all_outlets: {
            type: Boolean,
            default: false // If true, applies to all outlets
        },
        all_menus: {
            type: Boolean,
            default: false // If true, applies to all menus
        },
        all_categories: {
            type: Boolean,
            default: false // If true, applies to all categories
        }
    },
    { timestamps: true }
);

// **Indexes for optimized queries & uniqueness**
AddonSchema.index({ brand_id: 1, outlet_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Addon", AddonSchema);
