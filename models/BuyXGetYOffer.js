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
        buy_quantity: {
            type: Number,
            required: true,
            min: 1 // Minimum 1 item required to trigger the offer
        },
        buy_items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
                required: function () {
                    return !this.apply_on_all_items;
                }
            }
        ],
        apply_on_all_items: {
            type: Boolean,
            default: false
        },
        buy_categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
                required: function () {
                    return !this.apply_on_all_categories;
                }
            }
        ],
        apply_on_all_categories: {
            type: Boolean,
            default: false
        },
        buy_menus: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Menu",
                required: function () {
                    return !this.apply_on_all_menus;
                }
            }
        ],
        apply_on_all_menus: {
            type: Boolean,
            default: false
        },
        get_quantity: {
            type: Number,
            required: true,
            min: 1 // Minimum 1 free item required
        },
        get_items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
                required: true // Required as free item(s) must be specified
            }
        ],
        order_types: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "OrderType"
            }
        ],
        apply_on_all_order_types: {
            type: Boolean,
            default: false
        },
        day: {
            type: String,
            enum: [
                "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
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
        }
    },
    { timestamps: true }
);

// **Indexes for Optimized Queries & Uniqueness**
BuyXGetYSchema.index({ brand_id: 1, outlet_id: 1, name: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("BuyXGetYOffer", BuyXGetYSchema);
