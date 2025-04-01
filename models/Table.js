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
      trim: true,
      unique: true // Ensure table name is unique for the outlet
    },
    sitting: {
      type: Number,
      required: true,
      min: 1 // Minimum seating capacity of 1
    },
    type: {
      type: String,
      enum: ["square", "rectangle", "circle", "other"],
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active" // Default status is active
    }
  },
  { timestamps: true }
);

// **Indexes for Optimized Queries**
TableSchema.index({ brand_id: 1, outlet_id: 1, floor_id: 1, status: 1 });

module.exports = mongoose.model("Table", TableSchema);
