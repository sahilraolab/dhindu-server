const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, unique: true, trim: true, index: true },
    short_name: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, index: true },
    country_code: {
      type: String,
      required: true,
      trim: true
    },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    gst_no: { type: String, required: true, unique: true, trim: true },
    license_no: { type: String, required: true, unique: true, trim: true },
    food_license: { type: String, required: true, unique: true, trim: true },
    website: { type: String, unique: true, sparse: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    postal_code: { type: String, required: true, trim: true },
    street_address: { type: String, required: true, trim: true }
  },
  {
    timestamps: true
  }
);

BrandSchema.index({ owner_id: 1, status: 1 });

module.exports = mongoose.model("Brand", BrandSchema);
