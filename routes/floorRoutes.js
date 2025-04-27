const express = require("express");
const router = express.Router();
const Floor = require("../models/Floor");
const { verifyToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { floorCreateValidation, floorUpdateValidation } = require("../validators/floorValidator");

// Fetch Only Floor Name and ID for Staff's Brands & Outlets
router.get("/staff-floors/shorts", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const staffBrands = req.staff.brands || [];
        const staffOutlets = req.staff.outlets || [];

        if (!staffBrands.length || !staffOutlets.length) {
            return res.status(200).json({ message: "No brands or outlets assigned to staff", floors: [] });
        }

        const floors = await Floor.find(
            {
                brand_id: { $in: staffBrands },
                outlet_id: { $in: staffOutlets },
            },
            "_id floor_name outlet_id"
        );

        res.status(200).json({ message: "Floors fetched successfully", floors });
    } catch (error) {
        console.error("Error fetching staff floor shorts:", error);
        res.status(500).json({ message: "Error fetching staff floors", error });
    }
});

// Fetch Floors with populated brand and outlet
router.get("/staff-floors", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const staffBrands = req.staff.brands || [];
        const staffOutlets = req.staff.outlets || [];

        if (!staffBrands.length || !staffOutlets.length) {
            return res.status(200).json({ message: "No brands or outlets assigned to staff", floors: [] });
        }

        const floors = await Floor.find({
            brand_id: { $in: staffBrands },
            outlet_id: { $in: staffOutlets },
        })
            .populate("brand_id")
            .populate("outlet_id");

        res.status(200).json({ message: "Floors fetched successfully", floors });
    } catch (error) {
        console.error("Error fetching staff floors:", error);
        res.status(500).json({ message: "Error fetching staff floors", error });
    }
});

// Create Floor with uniqueness check
router.post("/create", verifyToken, floorCreateValidation, validateRequest, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brand_id, outlet_id, floor_name, status } = req.body;

        // ✅ Check if floor name already exists for the outlet
        const existingFloor = await Floor.findOne({ outlet_id, floor_name });
        if (existingFloor) {
            return res.status(400).json({ message: "A floor with the same name already exists in this outlet." });
        }

        const newFloor = new Floor({ brand_id, outlet_id, floor_name, status });
        await newFloor.save();

        const populatedFloor = await Floor.findById(newFloor._id)
            .populate("brand_id")
            .populate("outlet_id");

        res.status(201).json({ message: "Floor created successfully", floor: populatedFloor });
    } catch (error) {
        console.error("Error creating floor:", error);
        res.status(500).json({ message: "Error creating floor", error });
    }
});

// Update Floor with uniqueness check
router.put("/update/:id", verifyToken, floorUpdateValidation, validateRequest, async (req, res) => {
    if (!(req.staff?.permissions?.includes("settings_manage"))) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { floor_name, outlet_id } = req.body;
        const { id } = req.params;

        const floor = await Floor.findById(id);
        if (!floor) {
            return res.status(404).json({ message: "Floor not found" });
        }

        // ✅ Check for duplicate floor name in same outlet (excluding current floor)
        if (floor_name && outlet_id) {
            const duplicate = await Floor.findOne({
                _id: { $ne: id },
                outlet_id,
                floor_name
            });

            if (duplicate) {
                return res.status(400).json({ message: "Another floor with the same name exists in this outlet." });
            }
        }

        Object.assign(floor, req.body);
        await floor.save();

        const populatedFloor = await Floor.findById(floor._id)
            .populate("brand_id")
            .populate("outlet_id");

        res.status(200).json({ message: "Floor updated successfully", floor: populatedFloor });
    } catch (error) {
        console.error("Error updating floor:", error);
        res.status(500).json({ message: "Error updating floor", error });
    }
});

// Delete Floor
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("floor_delete") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const floor = await Floor.findById(req.params.id);
        if (!floor) {
            return res.status(404).json({ message: "Floor not found" });
        }

        await Floor.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Floor deleted successfully" });
    } catch (error) {
        console.error("Error deleting floor:", error);
        res.status(500).json({ message: "Error deleting floor", error });
    }
});

module.exports = router;
