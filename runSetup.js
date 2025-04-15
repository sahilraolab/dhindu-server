require("dotenv").config();
const mongoose = require("mongoose");
const { insertPermissions, insertDefaultRoles } = require("./permissionsRolesSetup");
const { insertFirstSetupData } = require("./insertFirstSetupData");

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/your-db-name";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log("✅ Connected to MongoDB.");
    await insertPermissions();
    await insertDefaultRoles();
    await insertFirstSetupData();
    console.log("✅ Setup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
