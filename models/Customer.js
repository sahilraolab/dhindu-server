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
        name: {  // ✅ Replaced first_name and last_name with name
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
            required: false,
            unique: true,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^\d{3}-\d{3}-\d{4}$/.test(v); // Must match ###-###-####
                },
                message: props => `${props.value} is not a valid phone number format! (Expected ###-###-####)`
            }
        },
        dob: {
            type: String, // Change type from Date to String
            trim: true,
            validate: {
                validator: function (value) {
                    return !value || /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{2}$/.test(value);
                },
                message: "Date of birth must be in MM/DD/YY format."
            }
        },
        anniversary_date: {
            type: String, // Change type from Date to String
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

// **Indexes for Optimized Queries & Uniqueness**
CustomerSchema.index({ phone: 1, brand_id: 1 }, { unique: true }); // Prevent duplicate phone numbers per brand
CustomerSchema.index({ email: 1, brand_id: 1 }, { unique: true, sparse: true }); // Unique emails if provided

module.exports = mongoose.model("Customer", CustomerSchema);
