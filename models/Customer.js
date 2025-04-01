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
            required: false // Customers can be global (brand-level) or specific to an outlet
        },
        first_name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },
        last_name: {
            type: String,
            trim: true,
            minlength: 2,
            maxlength: 50
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true, // Allows multiple customers without email, but unique if provided
            validate: {
                validator: function (v) {
                    return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email address!`
            }
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^\d{10,15}$/.test(v); // Supports 10 to 15 digit phone numbers
                },
                message: props => `${props.value} is not a valid phone number!`
            }
        },
        dob: {
            type: Date,
            validate: {
                validator: function (value) {
                    return !value || value < new Date(); // Date of birth cannot be in the future
                },
                message: "Date of birth cannot be in the future."
            }
        },
        anniversary_date: {
            type: Date,
            validate: {
                validator: function (value) {
                    return !value || value < new Date(); // Anniversary date cannot be in the future
                },
                message: "Anniversary date cannot be in the future."
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

// **Indexes for Optimized Queries & Uniqueness**
CustomerSchema.index({ phone: 1, brand_id: 1 }, { unique: true }); // Prevent duplicate phone numbers per brand
CustomerSchema.index({ email: 1, brand_id: 1 }, { unique: true, sparse: true }); // Unique emails if provided

module.exports = mongoose.model("Customer", CustomerSchema);
