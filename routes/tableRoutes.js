const express = require("express");
const router = express.Router();
const Table = require("../models/Table");
const { verifyToken } = require("../middleware/authMiddleware");

// Fetch Tables for Staff's Brands & Outlets
router.get("/staff-tables", verifyToken, async (req, res) => {
    if (!req.staff?.permissions?.includes("table_manage")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const staffBrands = req.staff.brands || [];
        const staffOutlets = req.staff.outlets || [];

        if (!staffBrands.length || !staffOutlets.length) {
            return res.status(200).json({ message: "No brands or outlets assigned to staff", tables: [] });
        }

        const tables = await Table.find({
            brand_id: { $in: staffBrands },
            outlet_id: { $in: staffOutlets },
        })
            .populate("brand_id")
            .populate("outlet_id")
            .populate("floor_id");

        res.status(200).json({ message: "Tables fetched successfully", tables });
    } catch (error) {
        console.error("Error fetching staff tables:", error);
        res.status(500).json({ message: "Error fetching staff tables", error });
    }
});

// Create Table
router.post("/create", verifyToken, async (req, res) => {
    if (!req.staff?.permissions?.includes("table_manage")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const { brand_id, outlet_id, floor_id, table_name, sitting, type, status } = req.body;

        if (!brand_id || !outlet_id || !floor_id || !table_name || !sitting || !type) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check for uniqueness of table_name within a floor
        const existingTable = await Table.findOne({ floor_id, table_name: table_name.trim() });
        if (existingTable) {
            return res.status(400).json({ message: "Table name already exists on this floor" });
        }

        const newTable = new Table({
            brand_id,
            outlet_id,
            floor_id,
            table_name: table_name.trim(),
            sitting,
            type,
            status
        });

        await newTable.save();

        const populatedTable = await Table.findById(newTable._id)
            .populate("brand_id")
            .populate("outlet_id")
            .populate("floor_id");

        res.status(201).json({ message: "Table created successfully", table: populatedTable });
    } catch (error) {
        console.error("Error creating table:", error);
        res.status(500).json({ message: "Error creating table", error });
    }
});

// Update Table
router.put("/update/:id", verifyToken, async (req, res) => {
    if (!req.staff?.permissions?.includes("table_manage")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const table = await Table.findById(req.params.id);
        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }

        const { table_name, floor_id } = req.body;

        // If table_name or floor_id is being updated, check uniqueness
        if ((table_name && table_name !== table.table_name) || (floor_id && floor_id !== table.floor_id.toString())) {
            const nameToCheck = table_name ? table_name.trim() : table.table_name;
            const floorToCheck = floor_id || table.floor_id;

            const existing = await Table.findOne({
                _id: { $ne: table._id },
                floor_id: floorToCheck,
                table_name: nameToCheck
            });

            if (existing) {
                return res.status(400).json({ message: "Table name already exists on this floor" });
            }
        }

        Object.assign(table, req.body);
        await table.save();

        const updatedTable = await Table.findById(table._id)
            .populate("brand_id")
            .populate("outlet_id")
            .populate("floor_id");

        res.status(200).json({ message: "Table updated successfully", table: updatedTable });
    } catch (error) {
        console.error("Error updating table:", error);
        res.status(500).json({ message: "Error updating table", error });
    }
});

// Delete Table
router.delete("/delete/:id", verifyToken, async (req, res) => {
    if (!req.staff?.permissions?.includes("table_manage")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const table = await Table.findById(req.params.id);
        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }

        await Table.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Table deleted successfully" });
    } catch (error) {
        console.error("Error deleting table:", error);
        res.status(500).json({ message: "Error deleting table", error });
    }
});

// Fetch All Tables
router.get("/all", verifyToken, async (req, res) => {
    if (!req.staff?.permissions?.includes("table_manage")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const tables = await Table.find()
            .populate("brand_id")
            .populate("outlet_id")
            .populate("floor_id");

        res.status(200).json({ message: "Tables fetched successfully", tables });
    } catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ message: "Error fetching tables", error });
    }
});

// Fetch Single Table
router.get("/:id", verifyToken, async (req, res) => {
    if (!req.staff?.permissions?.includes("table_manage")) {
        return res.status(403).json({ message: "Access denied! Unauthorized user." });
    }

    try {
        const table = await Table.findById(req.params.id)
            .populate("brand_id")
            .populate("outlet_id")
            .populate("floor_id");

        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }

        res.status(200).json({ message: "Table fetched successfully", table });
    } catch (error) {
        console.error("Error fetching table:", error);
        res.status(500).json({ message: "Error fetching table", error });
    }
});

module.exports = router;
