const express = require("express");
const router = express.Router();
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const { verifyToken } = require("../middleware/authMiddleware");

// GET all roles and permissions
router.get("/roles-permissions", verifyToken, async (req, res) => {
    try {
        // Fetch all roles
        const roles = await Role.find({});

        // Fetch all permissions
        const permissions = await Permission.find({});

        // Send the combined response
        res.status(200).json({
            success: true,
            data: {
                roles,
                permissions,
            },
        });
    } catch (error) {
        console.error("Error fetching roles and permissions:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
