const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Owner = require("./models/Owner");
const Brand = require("./models/Brand");
const Staff = require("./models/Staff");
const Role = require("./models/Role");

const insertFirstSetupData = async () => {
  try {
    // ✅ Connect to DB (if not handled externally)
    // await mongoose.connect("mongodb://localhost:27017/your-db-name");

    // ✅ Check if Owner already exists
    let owner = await Owner.findOne({ email: "karanrao@example.com" });
    if (!owner) {
      owner = await Owner.create({
        name: "Karan Rao",
        email: "karanrao@example.com",
        phone: "+1 123-456-7890",
        status: "active",
      });
      console.log("✅ Owner inserted:", owner.email);
    } else {
      console.log("ℹ️ Owner already exists:", owner.email);
    }

    // ✅ Check if Admin Role exists
    let adminRole = await Role.findOne({ name: "Admin" });
    if (!adminRole) {
      adminRole = await Role.create({
        name: "Admin",
        default_permissions: ["manage_brands", "manage_staff", "view_reports"],
      });
      console.log("✅ Admin Role created.");
    } else {
      console.log("ℹ️ Admin Role already exists.");
    }

    // ✅ Check if Brand already exists
    let brand = await Brand.findOne({ short_name: "Sector17" });
    if (!brand) {
      brand = await Brand.create({
        full_name: "Sector 17",
        short_name: "Sector17",
        email: "sector17@example.com",
        phone: "+1 987-654-3210",
        owner_id: owner._id,
        status: "active",
        gst_no: "GST123456789",
        license_no: "LIC987654321",
        food_license: "FSSAI123456",
        website: "https://sector17.com",
        city: "Toronto",
        state: "Ontario",
        country: "Canada",
        postal_code: "M5H 2N2",
        street_address: "123 Queen Street W",
      });
      console.log("✅ Brand inserted:", brand.full_name);
    } else {
      console.log("ℹ️ Brand already exists:", brand.full_name);
    }

    // ✅ Check if Admin Staff already exists
    let adminStaff = await Staff.findOne({ username: "admin" });
    if (!adminStaff) {
      const hashedPassword = await bcrypt.hash("AdminPass123", 10);
      const hashedPin = await bcrypt.hash("1234", 10);

      await Staff.create({
        name: "Karan Rao",
        username: "admin",
        email: "admin@sector17.com",
        phone: "+1 555-555-5555",
        password: hashedPassword,
        pos_login_pin: hashedPin,
        status: "active",
        role: adminRole._id,
        permissions: adminRole.default_permissions,
        brands: [brand._id],
        outlets: [],
      });
      console.log("✅ Admin Staff inserted.");
    } else {
      console.log("ℹ️ Admin Staff already exists.");
    }
  } catch (error) {
    console.error("❌ Error inserting first setup data:", error.message);
  }
};

module.exports = { insertFirstSetupData };
