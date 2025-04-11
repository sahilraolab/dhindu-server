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
            required: function () {
                return !this.apply_on_all_outlets; // Required if not applied to all outlets
            }
        },
        apply_on_all_outlets: {
            type: Boolean,
            default: false
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
        order_types: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "OrderType"
            }
        ],
        rate: {
            type: Number,
            required: true,
            min: 0 // Cannot be negative
        },
        type: {
            type: String,
            enum: ["fixed", "percentage"], // Fixed amount or percentage
            required: true
        },
        apply_on_all_menus: {
            type: Boolean,
            default: false
        },
        menus: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Menu"
            }
        ],
        apply_on_all_categories: {
            type: Boolean,
            default: false
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category"
            }
        ],
        apply_on_all_items: {
            type: Boolean,
            default: false
        },
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item"
            }
        ],
        day: {
            type: String,
            enum: [
                "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday, all_week"
            ],
            required: true
        },
        start_time: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
                },
                message: props => `${props.value} is not a valid time format (HH:mm)!`
            }
        },
        end_time: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
                },
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
            default: false // false = discount, true = coupon
        },
        coupon_code: {
            type: String,
            trim: true,
            unique: function () {
                return this.is_coupon; // Unique only if it's a coupon
            }
        },
        is_extra_charge: {
            type: Boolean,
            default: false // false = discount/coupon, true = extra charge
        }
    },
    { timestamps: true }
);

// **Indexes for Optimized Queries & Uniqueness**
DiscountSchema.index({ brand_id: 1, outlet_id: 1, name: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("Discount", DiscountSchema);
