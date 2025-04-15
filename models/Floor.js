const mongoose = require("mongoose");

const FloorSchema = new mongoose.Schema(
  {
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true
    },
    outlet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true
    },
    floor_name: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

// Indexes
FloorSchema.index({ brand_id: 1, outlet_id: 1, status: 1 });
FloorSchema.index({ outlet_id: 1, floor_name: 1 }, { unique: true }); // 👈 Enforces uniqueness

module.exports = mongoose.model("Floor", FloorSchema);
