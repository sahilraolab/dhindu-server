const express = require("express");
const router = express.Router();

const Outlet = require("../models/Outlet");
const Brand = require("../models/Brand");
const Staff = require("../models/Staff");

const { verifyToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { outletValidationRules } = require("../validators/outletValidator");

// ✅ Create an Outlet & Update Staff
router.post("/", verifyToken, outletValidationRules, validateRequest, async (req, res) => {
    try {
        const {
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
            postal_code,
        } = req.body;

        if (!req.staff?.permissions?.includes("staff_manage")) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        const brand = await Brand.findById(brand_id);
        if (!brand) return res.status(404).json({ message: "Brand not found!" });

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
            postal_code,
        });

        const staffUpdate = await Staff.findByIdAndUpdate(
            req.staff.id,
            { $push: { outlets: outlet._id } },
            { new: true }
        );

        const populatedOutlet = await Outlet.findById(outlet._id).populate("brand_id");

        return res.status(201).json({
            message: "Outlet created successfully!",
            outlet: populatedOutlet,
            updatedStaff: staffUpdate || "Staff not found, but outlet created!",
        });
    } catch (error) {
        console.error("Error creating outlet:", error);
        return res.status(500).json({ message: "Server error! Unable to create outlet." });
    }
});

// ✅ Get Only Assigned Outlets
router.get("/", verifyToken, async (req, res) => {
    try {
        if (!req.staff?.outlets?.length)
            return res.status(403).json({ message: "Access denied! No outlets assigned." });

        const outlets = await Outlet.find({ _id: { $in: req.staff.outlets } }).populate("brand_id");
        return res.status(200).json(outlets);
    } catch (error) {
        console.error("Error fetching outlets:", error);
        return res.status(500).json({ message: "Server error! Unable to fetch outlets." });
    }
});

// ✅ Update Outlet by ID
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const outlet = await Outlet.findById(id);
        if (!outlet) return res.status(404).json({ message: "Outlet not found!" });

        const hasAccess =
            req.staff?.permissions?.includes("staff_manage") ||
            req.staff.outlets.map((o) => o.toString()).includes(id);

        if (!hasAccess) {
            return res.status(403).json({ message: "Access denied! Unauthorized user." });
        }

        await Outlet.findByIdAndUpdate(id, req.body, { new: true });

        const updatedOutlet = await Outlet.findById(id).populate("brand_id");

        return res.status(200).json({
            message: "Outlet updated successfully!",
            outlet: updatedOutlet,
        });
    } catch (error) {
        console.error("Error updating outlet:", error);
        return res.status(500).json({ message: "Server error! Unable to update outlet." });
    }
});

// ✅ Get All Assigned Outlets (Only ID & Name)
router.get("/assigned/outlets", verifyToken, async (req, res) => {
    try {
        if (!req.staff?.outlets?.length)
            return res.status(403).json({ message: "Access denied! No outlets assigned." });

        const outlets = await Outlet.find(
            { _id: { $in: req.staff.outlets } },
            { _id: 1, name: 1, brand_id: 1 }
        );

        return res
            .status(200)
            .json(outlets.length ? outlets : { message: "No outlets found for assigned outlets." });
    } catch (error) {
        console.error("Error fetching assigned outlets:", error);
        return res.status(500).json({ message: "Server error! Unable to fetch outlets." });
    }
});

module.exports = router;
