const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
    {
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },
        outlet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            required: false
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email address!`
            }
        },
        phone: {
            type: String,
            trim: true
        },
        country_code: {
            type: String,
            required: true,
            trim: true
        },
        dob: {
            type: String,
            trim: true,
            validate: {
                validator: function (value) {
                    return !value || /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{2}$/.test(value);
                },
                message: "Date of birth must be in MM/DD/YY format."
            }
        },
        anniversary_date: {
            type: String,
            trim: true,
            validate: {
                validator: function (value) {
                    return !value || /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{2}$/.test(value);
                },
                message: "Anniversary date must be in MM/DD/YY format."
            }
        },
        address: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            zip: { type: String, trim: true },
            country: { type: String, trim: true, default: "Canada" }
        },
        order_history: [
            {
                order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
                total_amount: { type: Number, min: 0 },
                order_date: { type: Date, default: Date.now }
            }
        ],
        status: {
            type: String,
            enum: ["active", "inactive", "banned"],
            default: "active"
        }
    },
    { timestamps: true }
);

// Removed schema-level validation (pre hook) and unique indexes
// because duplicates are handled in API logic

module.exports = mongoose.model("Customer", CustomerSchema);
