const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
    {
        menu_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true
        },
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
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true // Every item must belong to a category
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500
        },
        price: {
            type: Number,
            required: true,
            min: 0 // Price cannot be negative
        },
        food_type: {
            type: String,
            enum: ["veg", "non-veg", "vegan"],
            required: true // Mandatory field to specify food type
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
        ],
        addons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Addon" // Reference to Addon Schema
            }
        ],
        images: [
            {
                url: { type: String, required: true },
                alt_text: { type: String, trim: true }
            }
        ]
    },
    { timestamps: true }
);

// **Indexes for optimized queries & uniqueness**
ItemSchema.index(
    { menu_id: 1, brand_id: 1, outlet_id: 1, name: 1 },
    { unique: true, partialFilterExpression: { apply_on_all_outlets: false } }
);
ItemSchema.index(
    { menu_id: 1, brand_id: 1, name: 1 },
    { unique: true, partialFilterExpression: { apply_on_all_outlets: true } }
);

module.exports = mongoose.model("Item", ItemSchema);
