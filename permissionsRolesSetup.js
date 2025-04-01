const Permission = require("./models/Permission");
const Role = require("./models/Role");

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

module.exports = { insertPermissions, insertDefaultRoles };
