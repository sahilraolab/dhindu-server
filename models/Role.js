const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., Admin, Manager, Cashier
    default_permissions: [{ type: String, required: true }], // List of permission keys
  },
  { timestamps: true }
);

// Prevent API modifications (Only manually editable)
RoleSchema.set("collection", "roles");

module.exports = mongoose.model("Role", RoleSchema);
