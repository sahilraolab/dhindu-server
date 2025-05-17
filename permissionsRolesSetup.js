const Permission = require("./models/Permission");
const Role = require("./models/Role");

const defaultPermissions = [
  { category: "Dashboard", options: ["dashboard_view"] },
  { category: "Brand Configuration", options: [
    "brand_manage", "staff_manage", "outlet_manage", "order_type_manage", "payment_type_manage"
  ]},
  { category: "Master Configuration", options: [
    "tax_manage", "floor_manage", "table_manage", "discount_manage", "buyxgety_manage"
  ]},
  { category: "Menu Configuration", options: [
    "category_manage", "menu_manage", "addon_manage"
  ]},
  { category: "CRM", options: [
    "customers_view", "customers_edit", "customers_delete",
    "orders_view", "orders_edit", "orders_delete",
    "whatsapp_manage"
  ]}
];


const defaultRoles = [
  {
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
  },
  {
    name: "Manager",
    default_permissions: [
      "dashboard_view",
      "staff_manage", "outlet_manage", "order_type_manage", "payment_type_manage",
      "floor_manage", "table_manage", "discount_manage",
      "category_manage", "menu_manage",
      "customers_view", "customers_edit",
      "orders_view", "orders_edit",
      "whatsapp_manage"
    ],
  },
  {
    name: "Cashier",
    default_permissions: [
      "dashboard_view",
      "orders_view", "orders_edit",
      "customers_view", "sales_create" // include if needed
    ],
  },
  {
    name: "Inventory Manager",
    default_permissions: [
      "category_manage", "menu_manage", "addon_manage",
      "floor_manage", "table_manage", "tax_manage",
      "buyxgety_manage"
    ],
  },
  {
    name: "Staff",
    default_permissions: [
      "dashboard_view",
      "orders_view",
      "customers_view"
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
