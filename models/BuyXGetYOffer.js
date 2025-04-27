const mongoose = require("mongoose");

const BuyXGetYSchema = new mongoose.Schema(
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
            maxlength: 100
        },
        menu_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true
        },
        buy_item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },
        buy_quantity: {
            type: Number,
            required: true,
            min: 1
        },
        get_item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },
        get_quantity: {
            type: Number,
            required: true,
            min: 1
        },
        rate: {
            type: Number,
            required: true,
            min: 0
        },
        day: {
            type: String,
            enum: [
                "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "all_week"
            ],
            required: true
        },
        start_time: {
            type: Date,
            required: true
        },
        end_time: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    { timestamps: true }
);

// Unique index
BuyXGetYSchema.index({ brand_id: 1, outlet_id: 1, name: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("BuyXGetYOffer", BuyXGetYSchema);
