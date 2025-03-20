require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Role = require("./models/Role"); // Role Model
const Permission = require("./models/Permission"); // Permission Model

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // Insert Permissions First
    await insertPermissions();

    // Insert Default Roles
    await insertDefaultRoles();
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Permissions Data
const defaultPermissions = [
  { category: "Dashboard", options: ["dashboard_view"] },
  { category: "Orders", options: ["orders_view", "orders_edit", "orders_delete"] },
  { category: "Sales", options: ["sales_view", "sales_create", "sales_edit", "sales_delete"] },
  { category: "Customers", options: ["customers_view", "customers_edit", "customers_delete"] },
  { category: "Inventory", options: ["inventory_view", "inventory_edit", "inventory_delete"] },
  { category: "Settings", options: ["settings_manage"] },
  { category: "Reports", options: ["reports_view", "reports_edit", "reports_delete"] },
  { category: "Staff Management", options: ["staff_manage"] }
];

// Function to insert permissions
const insertPermissions = async () => {
  try {
    for (const perm of defaultPermissions) {
      for (const option of perm.options) {
        const exists = await Permission.findOne({ name: option });
        if (!exists) {
          await Permission.create({ name: option, category: perm.category });
        }
      }
    }
    console.log("✅ Permissions inserted successfully.");
  } catch (error) {
    console.error("❌ Error inserting permissions:", error);
  }
};

// Default roles data
const defaultRoles = [
  {
    name: "Admin",
    default_permissions: [
      "dashboard_view", "orders_view", "orders_edit", "orders_delete",
      "sales_view", "sales_create", "sales_edit", "sales_delete",
      "customers_view", "customers_edit", "customers_delete",
      "inventory_view", "inventory_edit", "inventory_delete",
      "settings_manage", "reports_view", "reports_edit", "reports_delete",
      "staff_manage"
    ],
  },
  {
    name: "Manager",
    default_permissions: [
      "dashboard_view", "orders_view", "orders_edit",
      "sales_view", "sales_create", "sales_edit",
      "customers_view", "customers_edit",
      "inventory_view", "inventory_edit",
      "reports_view", "reports_edit"
    ],
  },
  {
    name: "Cashier",
    default_permissions: [
      "dashboard_view", "orders_view",
      "sales_view", "sales_create", "customers_view"
    ],
  },
  {
    name: "Inventory Manager",
    default_permissions: [
      "inventory_view", "inventory_edit", "inventory_delete",
      "reports_view"
    ],
  },
  {
    name: "Staff",
    default_permissions: [
      "dashboard_view", "orders_view",
      "sales_view", "customers_view"
    ],
  }
];

// Function to insert default roles
const insertDefaultRoles = async () => {
  try {
    for (const role of defaultRoles) {
      const exists = await Role.findOne({ name: role.name });
      if (!exists) {
        await Role.create(role);
      }
    }
    console.log("✅ Default roles inserted successfully.");
  } catch (error) {
    console.error("❌ Error inserting roles:", error);
  }
};

// Define the PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
