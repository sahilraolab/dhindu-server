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

        apply_type: {
            type: String,
            enum: ["discount", "coupon", "extra_charge"],
            required: true
        },

        apply_on_all_order_types: {
            type: Boolean,
            default: false
        },
        order_type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderType",
            default: null
        },

        apply_on_all_menus: {
            type: Boolean,
            default: false
        },
        menu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            default: null
        },

        apply_on_all_categories: {
            type: Boolean,
            default: false
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },

        apply_on_all_items: {
            type: Boolean,
            default: false
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            default: null
        },

        type: {
            type: String,
            enum: ["fixed", "percentage"],
            required: true
        },
        rate: {
            type: Number,
            required: true,
            min: 0
        },

        day: {
            type: String,
            enum: [
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "all_week"
            ],
        },

        start_time: {
            type: String,
            default: "",
            validate: {
                validator: v => v === "" || /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
                message: props => `${props.value} is not a valid time format (HH:mm) or empty!`
            }
        },
        end_time: {
            type: String,
            default: "",
            validate: {
                validator: v => v === "" || /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
                message: props => `${props.value} is not a valid time format (HH:mm) or empty!`
            }
        },


        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },

        code: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

DiscountSchema.index(
    { brand_id: 1, outlet_id: 1, name: 1, day: 1 },
    { unique: true }
);

module.exports = mongoose.model("Discount", DiscountSchema);
