const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Schema Definition
const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    brand_address: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      code: { type: String, required: true },
      street_address: { type: String, required: true },
    },
  },
  { timestamps: true }
);

// Hash password before saving
BrandSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Brand", BrandSchema);
