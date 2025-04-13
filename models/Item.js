const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
    {
        menu_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true
        },
        category_name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        food_type: {
            type: String,
            enum: ["veg", "non-veg", "vegan"],
            required: true
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        image: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
);

// Unique index to prevent duplicate item names in the same menu
ItemSchema.index({ menu_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Item", ItemSchema);
