// runSetup.js
const { insertPermissions, insertDefaultRoles } = require("./permissionsRolesSetup");
const { insertFirstSetupData } = require("./insertFirstSetupData");

(async () => {
  try {
    await insertPermissions();
    await insertDefaultRoles();
    await insertFirstSetupData();
    console.log("✅ Setup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
})();
