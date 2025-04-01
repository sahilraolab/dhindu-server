const express = require("express");
const router = express.Router();
const Outlet = require("../models/Outlet");
const Brand = require("../models/Brand");
const Staff = require("../models/Staff");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ Create an Outlet & Update Staff (Protected Route)
router.post("/", verifyToken, async (req, res) => {
    try {
        const { brand_id, name, code, email, phone, timezone, opening_time, closing_time, website, street, city, state, country, postal_code } = req.body;

        if (!req.staff?.permissions?.includes("staff_manage") || req.staff?.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        // Check if brand exists
        const brand = await Brand.findById(brand_id);
        if (!brand) return res.status(404).json({ message: "Brand not found!" });

        // Create new outlet with separated address fields
        const outlet = await Outlet.create({
            brand_id,
            name,
            code,
            email,
            phone,
            timezone,
            opening_time,
            closing_time,
            website,
            street,
            city,
            state,
            country,
            postal_code
        });

        // ✅ Update Staff document if exists
        const staffUpdate = await Staff.findByIdAndUpdate(req.staff.id, { $push: { outlets: outlet._id } }, { new: true });

        return res.status(201).json({
            message: "Outlet created successfully!",
            outlet,
            updatedStaff: staffUpdate || "Staff not found, but outlet created!",
        });
    } catch (error) {
        console.error("Error creating outlet:", error);
        return res.status(500).json({ message: "Server error! Unable to create outlet." });
    }
});

// ✅ Get Only Assigned Outlets (Protected Route)
router.get("/", verifyToken, async (req, res) => {
    try {
        if (!req.staff?.outlets?.length) return res.status(403).json({ message: "Access denied! No outlets assigned." });

        const outlets = await Outlet.find({ _id: { $in: req.staff.outlets } }).populate("brand_id");
        return res.status(200).json(outlets);
    } catch (error) {
        console.error("Error fetching outlets:", error);
        return res.status(500).json({ message: "Server error! Unable to fetch outlets." });
    }
});

// ✅ Get Outlets by Brand ID (Protected Route)
router.get("/brand/:brand_id", verifyToken, async (req, res) => {
    try {
        const { brand_id } = req.params;

        if (!(await Brand.findById(brand_id))) return res.status(404).json({ message: "Brand not found!" });

        const outlets = await Outlet.find({ brand_id });
        if (!outlets.length) return res.status(404).json({ message: "No outlets found for this brand!" });

        return res.status(200).json(outlets);
    } catch (error) {
        console.error("Error fetching outlets by brand ID:", error);
        return res.status(500).json({ message: "Server error! Unable to fetch outlets." });
    }
});

// ✅ Get Outlet by ID (Protected Route)
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.staff.role !== "admin" || !req.staff.outlets.map(o => o.toString()).includes(id)) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        const outlet = await Outlet.findById(id);
        if (!outlet) return res.status(404).json({ message: "Outlet not found!" });

        return res.status(200).json(outlet);
    } catch (error) {
        console.error("Error fetching outlet:", error);
        return res.status(500).json({ message: "Server error! Unable to fetch outlet." });
    }
});

// ✅ Update Outlet by ID (Protected Route)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const outlet = await Outlet.findById(id);
        if (!outlet) return res.status(404).json({ message: "Outlet not found!" });

        if (req.staff.role !== "admin" || !req.staff.outlets.map(o => o.toString()).includes(id)) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        const updatedOutlet = await Outlet.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json({ message: "Outlet updated successfully!", outlet: updatedOutlet });
    } catch (error) {
        console.error("Error updating outlet:", error);
        return res.status(500).json({ message: "Server error! Unable to update outlet." });
    }
});

// ✅ Get All Assigned Outlets (Only Outlet ID & Name)
router.get("/assigned/outlets", verifyToken, async (req, res) => {
    try {
        if (!req.staff?.outlets?.length) return res.status(403).json({ message: "Access denied! No outlets assigned." });

        const outlets = await Outlet.find({ _id: { $in: req.staff.outlets } }, { _id: 1, name: 1, brand_id: 1 });

        return res.status(200).json(outlets.length ? outlets : { message: "No outlets found for assigned outlets." });
    } catch (error) {
        console.error("Error fetching assigned outlets:", error);
        return res.status(500).json({ message: "Server error! Unable to fetch outlets." });
    }
});

module.exports = router;
