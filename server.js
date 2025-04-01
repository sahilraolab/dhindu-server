require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const Role = require("./models/Role"); // Role Model
const Permission = require("./models/Permission"); // Permission Model
const Owner = require("./models/Owner");
const Brand = require("./models/Brand");
const Staff = require("./models/Staff");
const Outlet = require("./models/Outlet");

const staffRoutes = require("./routes/staffRoutes");
const brandRoutes = require("./routes/brandRoutes");
const outletRoutes = require("./routes/outletRoutes");
const rolesPermissionsRoutes = require("./routes/roles_permissionsRoutes");
const buyXgetYoffersRoutes = require("./routes/buyX_getY_offersRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const discountRoutes = require("./routes/discountRoutes");
const floorRoutes = require("./routes/floorRoutes");
const itemRoutes = require("./routes/itemRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderTypeRoutes = require("./routes/orderTypeRoutes");
const paymentTypeRoutes = require("./routes/paymentTypeRoutes");
const tableRoutes = require("./routes/tableRoutes");
const taxRoutes = require("./routes/taxRoutes");
const addonRoutes = require("./routes/addonRoutes");

const { insertPermissions, insertDefaultRoles } = require("./permissionsRolesSetup");
const { insertFirstSetupData } = require("./insertFirstSetupData");
const { default: axios } = require("axios");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",  // Allow requests from frontend
  credentials: true,  // Allow cookies, tokens, and sessions
  methods: ["GET", "POST", "PUT", "DELETE"],  // Allow only required methods
  allowedHeaders: ["Content-Type", "Authorization"],  // Limit allowed headers
}));


app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // await insertPermissions();
    // await insertDefaultRoles();
    // await insertFirstSetupData();

  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });
  
const insertFirstSetupData = async () => {
  try {
    // Insert Owner
    const owner = await Owner.create({
      name: "Karan Rao",
      email: "karanrao@example.com",
      password: "SecurePass123", // Ensure to hash passwords before using in production
      phone: "+1 123-456-7890",
      is_password_changed: false,
      status: "active",
    });

    // Insert Brand
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
      brand_address: {
        city: "Toronto",
        state: "Ontario",
        country: "Canada",
        code: "M5H 2N2",
        street_address: "123 Queen Street W",
      },
    });

    // Insert Admin Staff
    await Staff.create({
      name: "Karan Rao",
      email: "admin@sector17.com",
      phone: "+1 555-555-5555",
      password: "AdminPass123", // Ensure to hash passwords before using in production
      pos_login_pin: "1234",
      role: "Admin",
      permissions: [
        "dashboard_view", "orders_view", "orders_edit", "orders_delete",
        "sales_view", "sales_create", "sales_edit", "sales_delete",
        "customers_view", "customers_edit", "customers_delete",
        "inventory_view", "inventory_edit", "inventory_delete",
        "settings_manage", "reports_view", "reports_edit", "reports_delete",
        "staff_manage"
      ],
      brands: [brand._id],
      outlets: [],
    });

    console.log("✅ First setup data inserted successfully.");
  } catch (error) {
    console.error("❌ Error inserting first setup data:", error);
  }
};

app.get("/", (req, res) => {
  res.send("✅ POS API is running...");
});

app.get("/validate_token", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, "your_secret_key");

    // Fetch staff details from the database
    const staff = await Staff.findById(decoded.id).select("-password"); // Exclude password for security

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.json({ staff });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});


app.use("/api/staff", staffRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/utils", rolesPermissionsRoutes);
app.use("/api/taxes", taxRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/payment-types", paymentTypeRoutes);
app.use("/api/order-types", orderTypeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menues", menuRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/floors", floorRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/buyX-getY-offers", buyXgetYoffersRoutes);
app.use("/api/addons", addonRoutes);


// Define the PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
