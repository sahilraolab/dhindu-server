const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  category: { type: String, required: true }
});

module.exports = mongoose.model("Permission", PermissionSchema);
