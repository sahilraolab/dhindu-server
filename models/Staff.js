const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const StaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    pos_login_pin: { type: String }, // Now optional
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    permissions: [{ type: String, required: true }], 
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    outlets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Outlet" }],
  },
  { timestamps: true }
);

// Ensure password and POS PIN are only hashed once
StaffSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isModified("pos_login_pin") && this.pos_login_pin) {
    this.pos_login_pin = await bcrypt.hash(this.pos_login_pin, 10);
  }

  next();
});


// Compare entered password with stored hash
StaffSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compare entered POS PIN with stored hash
StaffSchema.methods.comparePOSPin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pos_login_pin);
};

// Indexes for fast queries
StaffSchema.index({ email: 1 });
StaffSchema.index({ phone: 1 });

module.exports = mongoose.model("Staff", StaffSchema);
