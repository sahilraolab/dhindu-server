const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema(
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
    floor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
      required: true
    },
    table_name: {
      type: String,
      required: true,
      trim: true
      // Removed global unique constraint here
    },
    sitting: {
      type: Number,
      required: true,
      min: 1
    },
    type: {
      type: String,
      enum: ["square", "rectangle", "circle", "other"],
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

// ✅ Compound index to enforce uniqueness of table_name per floor
TableSchema.index({ floor_id: 1, table_name: 1 }, { unique: true });

// Other helpful indexes
TableSchema.index({ brand_id: 1, outlet_id: 1, floor_id: 1, status: 1 });

module.exports = mongoose.model("Table", TableSchema);
