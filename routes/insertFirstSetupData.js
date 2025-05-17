const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const Owner = require("../models/Owner");
const Brand = require("../models/Brand");
const Staff = require("../models/Staff");
const Role = require("../models/Role");

router.post("/setup", async (req, res) => {
  try {
    const {
      super_email,
      super_password,
      super_pin,
      ownerData,
      brandData,
      staffData // Only contains password and pin now
    } = req.body;

    // ✅ Validate super admin credentials from .env
    if (
      super_email !== process.env.SETUP_EMAIL ||
      super_password !== process.env.SETUP_PASSWORD ||
      super_pin !== process.env.SETUP_PIN
    ) {
      return res.status(401).json({ message: "Unauthorized: Invalid super admin credentials" });
    }

    // ✅ Create Owner (or find existing)
    let owner = await Owner.findOne({ email: ownerData.email });
    if (!owner) {
      owner = await Owner.create(ownerData);
    }

    // ✅ Ensure Admin Role exists
    let adminRole = await Role.findOne({ name: "Admin" });
    if (!adminRole) {
      adminRole = await Role.create({
        name: "Admin",
        default_permissions: [
          "dashboard_view",
          "brand_manage", "staff_manage", "outlet_manage", "order_type_manage", "payment_type_manage",
          "tax_manage", "floor_manage", "table_manage", "discount_manage", "buyxgety_manage",
          "category_manage", "menu_manage", "addon_manage",
          "customers_view", "customers_edit", "customers_delete",
          "orders_view", "orders_edit", "orders_delete",
          "whatsapp_manage"
        ],
      });
    }

    // ✅ Create Brand (if not exists)
    let brand = await Brand.findOne({ short_name: brandData.short_name });
    if (!brand) {
      brandData.owner_id = owner._id;
      brand = await Brand.create(brandData);
    }

    // ✅ Hash password and POS pin
    const hashedPassword = await bcrypt.hash(staffData.password, 10);
    const hashedPin = await bcrypt.hash(staffData.pin, 10);

    // ✅ Check if staff already exists
    const existingStaff = await Staff.findOne({ email: ownerData.email });
    if (!existingStaff) {
      await Staff.create({
        name: ownerData.name,
        email: ownerData.email,
        phone: ownerData.phone,
        country_code: ownerData.country_code || "+1",
        password: hashedPassword,
        pos_login_pin: hashedPin,
        status: "active",
        owner_id: owner._id,
        role: adminRole._id,
        permissions: adminRole.default_permissions,
        brands: [brand._id],
        outlets: [], // Optional, will be auto-handled later if needed
      });
    }

    return res.status(200).json({ message: "Setup data inserted successfully" });
  } catch (err) {
    console.error("❌ Error inserting setup data:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
