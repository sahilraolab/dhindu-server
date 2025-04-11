const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Owner = require("./models/Owner");
const Brand = require("./models/Brand");
const Staff = require("./models/Staff");
const Role = require("./models/Role");

const insertFirstSetupData = async () => {
  try {
    // ✅ Insert Owner
    const owner = await Owner.create({
      name: "Karan Rao",
      email: "karanrao@example.com",
      phone: "+1 123-456-7890",
      status: "active",
    });
    console.log("✅ Owner inserted:", owner.email);

    // ✅ Fetch "Admin" Role ID
    let adminRole = await Role.findOne({ name: "Admin" });
    if (!adminRole) {
      adminRole = await Role.create({
        name: "Admin",
        default_permissions: ["manage_brands", "manage_staff", "view_reports"],
      });
    }

    console.log("✅ Role inserted/found:", adminRole.name);

    // ✅ Insert Brand
    const brand = await Brand.create({
      name: "Sector 17",
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
    console.log("✅ Brand inserted:", brand.name);

    // ✅ Hash password and PIN before saving Staff
    const hashedPassword = await bcrypt.hash("AdminPass123", 10);
    const hashedPin = await bcrypt.hash("1234", 10);

    // ✅ Insert Admin Staff
    await Staff.create({
      name: "Karan Rao",
      username: "admin",
      email: "admin@sector17.com",
      phone: "+1 555-555-5555",
      password: hashedPassword, // Hashed password
      pos_login_pin: hashedPin, // Hashed PIN
      status: "active",
      role: adminRole._id,
      permissions: adminRole.default_permissions,
      brands: [brand._id],
      outlets: [],
    });
    console.log("✅ Admin Staff inserted successfully.");
  } catch (error) {
    console.error("❌ Error inserting first setup data:", error);
  }
};

module.exports = { insertFirstSetupData };
