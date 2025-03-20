const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const StaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed before saving
    pos_login_pin: { type: String, required: true, minlength: 4, maxlength: 4 }, // 4-digit PIN

    role: { type: String, required: true }, // e.g., "Manager", "Cashier"
    permissions: [{ type: String, required: true }], // Custom permissions assigned to staff

    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }], // Associated brands
    outlets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Outlet" }], // Assigned outlets
  },
  { timestamps: true }
);

// **Pre-save hook to hash password before storing in DB**
StaffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password isn't modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Staff", StaffSchema);
