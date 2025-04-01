const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    short_name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    gst_no: { type: String, required: true, unique: true },
    license_no: { type: String, required: true, unique: true },
    food_license: { type: String, required: true, unique: true },
    website: { type: String, unique: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postal_code: { type: String, required: true },
    street_address: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", BrandSchema);
