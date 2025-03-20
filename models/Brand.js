const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    short_name: { type: String, required: true }, // Short name of the brand
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Owner of this brand
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    gst_no: { type: String, required: true }, // GST Number
    license_no: { type: String, required: true }, // Business License Number
    food_license: { type: String, required: true }, // Food License Number (FSSAI)
    website: { type: String }, // Optional website field

    brand_address: {
      city: { type: String },
      state: { type: String },
      country: { type: String },
      code: { type: String }, // Postal/Zip code
      street_address: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", BrandSchema);
