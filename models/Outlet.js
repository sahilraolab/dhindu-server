const mongoose = require("mongoose");

const OutletSchema = new mongoose.Schema(
  {
    brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true }, // Reference to Brand
    name: { type: String, required: true }, // Outlet name

    code: { type: String, required: true }, // Outlet code (Unique within a brand)
    email: { type: String, required: true }, // Outlet email (Unique within a brand)
    phone: { type: String, required: true }, // Outlet phone number (Unique within a brand)

    timezone: { type: String, required: true }, // Timezone of the outlet
    opening_time: { type: String, required: true }, // Opening time (HH:mm format)
    closing_time: { type: String, required: true }, // Closing time (HH:mm format)

    website: { type: String }, // Optional website URL

    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postal_code: { type: String },

    status: { type: String, enum: ["active", "inactive"], default: "active" }, // Outlet status
  },
  { timestamps: true }
);

// Creating compound indexes to enforce uniqueness within a brand
OutletSchema.index({ brand_id: 1, code: 1 }, { unique: true }); // Ensures outlet code is unique per brand
OutletSchema.index({ brand_id: 1, email: 1 }, { unique: true }); // Ensures email is unique per brand
OutletSchema.index({ brand_id: 1, phone: 1 }, { unique: true }); // Ensures phone is unique per brand

module.exports = mongoose.model("Outlet", OutletSchema);
