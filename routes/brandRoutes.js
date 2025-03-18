const express = require("express");
const Brand = require("../models/Brand");
const router = express.Router();

// Create a new brand
router.post("/", async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json({ success: true, brand: await Brand.findById(brand._id).select("-password") });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all brands
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find().select("-password");
    res.status(200).json({ success: true, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a brand by email or _id
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const brand = await Brand.findOne({
      $or: [{ _id: identifier }, { email: identifier }],
    }).select("-password");

    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    res.status(200).json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a brand by _id or email
router.put("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const updatedBrand = await Brand.findOneAndUpdate(
      { $or: [{ _id: identifier }, { email: identifier }] },
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedBrand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    res.status(200).json({ success: true, brand: updatedBrand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete a brand by _id or email
router.delete("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const deletedBrand = await Brand.findOneAndDelete({
      $or: [{ _id: identifier }, { email: identifier }],
    });

    if (!deletedBrand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    res.status(200).json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
