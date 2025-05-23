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
                "sunday", "monday", "tuesday", "wednesday", "thursday",
                "friday", "saturday", "all_week"
            ],
            default: null
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
        }
    },
    { timestamps: true }
);

// Unique index only when 'day' is a string
BuyXGetYSchema.index(
    { brand_id: 1, outlet_id: 1, name: 1, day: 1 },
    { unique: true, partialFilterExpression: { day: { $type: "string" } } }
);

module.exports = mongoose.model("BuyXGetYOffer", BuyXGetYSchema);
