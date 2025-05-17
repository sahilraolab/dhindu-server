const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const OwnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    country_code: {
      type: String,
      required: true,
      trim: true
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Owner", OwnerSchema);
