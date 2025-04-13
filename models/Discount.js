const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema(
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
        apply_on_all_order_types: {
            type: Boolean,
            default: false
        },
        order_types: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderType"
        }],
        rate: {
            type: Number,
            required: true,
            min: 0
        },
        type: {
            type: String,
            enum: ["fixed", "percentage"],
            required: true
        },
        apply_on_all_menus: {
            type: Boolean,
            default: false
        },
        menus: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu"
        }],
        apply_on_all_categories: {
            type: Boolean,
            default: false
        },
        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],
        apply_on_all_items: {
            type: Boolean,
            default: false
        },
        items: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        }],
        day: {
            type: String,
            enum: [
                "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "all_week"
            ],
            required: true
        },
        start_time: {
            type: String,
            required: true,
            validate: {
                validator: v => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
                message: props => `${props.value} is not a valid time format (HH:mm)!`
            }
        },
        end_time: {
            type: String,
            required: true,
            validate: {
                validator: v => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
                message: props => `${props.value} is not a valid time format (HH:mm)!`
            }
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        is_coupon: {
            type: Boolean,
            default: false
        },
        coupon_code: {
            type: String,
            trim: true
        },
        is_extra_charge: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Index for uniqueness
DiscountSchema.index({ brand_id: 1, outlet_id: 1, name: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("Discount", DiscountSchema);
