const express = require("express");
const router = express.Router();
const Floor = require("../models/Floor");
const verifyToken = require("../middlewares/verifyToken");

// Create Floor
router.post("/create", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("floor_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brand_id, outlet_id, floor_name, status } = req.body;

        const newFloor = new Floor({
            brand_id,
            outlet_id,
            floor_name,
            status
        });

        await newFloor.save();
        res.status(201).json({ message: "Floor created successfully", floor: newFloor });
    } catch (error) {
        console.error("Error creating floor:", error);
        res.status(500).json({ message: "Error creating floor", error });
    }
});

// Update Floor
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("floor_edit") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const floor = await Floor.findById(req.params.id);
        if (!floor) {
            return res.status(404).json({ message: "Floor not found" });
        }

        Object.assign(floor, req.body); // Update fields
        await floor.save();
        res.status(200).json({ message: "Floor updated successfully", floor });
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

// Fetch All Floors
router.get("/all", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("floor_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const floors = await Floor.find()
            .populate("brand_id")
            .populate("outlet_id");

        res.status(200).json({ message: "Floors fetched successfully", floors });
    } catch (error) {
        console.error("Error fetching floors:", error);
        res.status(500).json({ message: "Error fetching floors", error });
    }
});

// Fetch Single Floor
router.get("/:id", verifyToken, async (req, res) => {
    if (!(req.staff?.permissions?.includes("floor_view") || req.staff?.role === "admin")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const floor = await Floor.findById(req.params.id)
            .populate("brand_id")
            .populate("outlet_id");

        if (!floor) {
            return res.status(404).json({ message: "Floor not found" });
        }

        res.status(200).json({ message: "Floor fetched successfully", floor });
    } catch (error) {
        console.error("Error fetching floor:", error);
        res.status(500).json({ message: "Error fetching floor", error });
    }
});

module.exports = router;
