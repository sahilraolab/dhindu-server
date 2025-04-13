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

const app = express();

const allowedOrigins = process.env.WHITELISTED_ORIGINS?.split(",") || [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
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

app.get("/", (req, res) => {
  res.send("✅ POS API is running...");
});

app.get("/validate_token", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, "your_secret_key");

    // Fetch staff details from the database and populate the role field
    const staff = await Staff.findById(decoded.id)
      .select("-password") // Exclude password for security
      .populate("role"); // Populate the role field with full role info

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Check if the staff is inactive
    if (staff.status !== 'active') {
      return res.status(403).json({ message: "Access denied. Staff is inactive." });
    }

    res.json({ staff });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});


app.post("/api/staff/logout", (req, res) => {
  // Clear the token from the cookies
  res.clearCookie("token", {
    httpOnly: true, // Ensures that the cookie is not accessible via JavaScript
    secure: process.env.NODE_ENV === "production", // Set to true if your app is served over HTTPS
    sameSite: "Strict", // Prevents sending cookies with cross-site requests
    path: "/",
  });

  // Send a response indicating the user has logged out
  res.json({ message: "Logged out successfully" });
});


app.use("/api/staff", staffRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/utils", rolesPermissionsRoutes);
app.use("/api/taxes", taxRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/payment-type", paymentTypeRoutes);
app.use("/api/order-type", orderTypeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menus", menuRoutes);
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
