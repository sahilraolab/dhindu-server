const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // Hashed password
    pos_login_pin: { type: String }, // Optional
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    permissions: [{ type: String, required: true }],
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    outlets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Outlet" }],
  },
  { timestamps: true }
);

// 👉 Compound indexes to ensure uniqueness within the same brand
StaffSchema.index({ "brands": 1, email: 1 }, { unique: true, sparse: true });
StaffSchema.index({ "brands": 1, phone: 1 }, { unique: true, sparse: true });
StaffSchema.index({ "brands": 1, name: 1 }, { unique: true, sparse: true });

// Optional: Single field indexes (if you often search by these individually)
StaffSchema.index({ email: 1 });
StaffSchema.index({ phone: 1 });

module.exports = mongoose.model("Staff", StaffSchema);
