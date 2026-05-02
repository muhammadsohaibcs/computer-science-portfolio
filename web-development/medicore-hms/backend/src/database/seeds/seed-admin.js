const mongoose = require('mongoose');
const User = require('../../models/user.model');
const argon2 = require('argon2');
const dbConfig = require('../../config/db.config');

async function seed() {
  // Connect to DB
  await mongoose.connect(dbConfig.url, dbConfig.options);
  console.log("Connected to MongoDB…");

  // Check existing admin
  const exists = await User.findOne({ username: "admin" });
  if (exists) {
    console.log("Admin already exists");
    process.exit(0);
  }

  // Hash password
  const hash = await argon2.hash("Admin@123456");

  // Create admin user WITHOUT profileRef
  const admin = new User({
    username: "admin",
    passwordHash: hash,
    role: "Admin"
  });
  // CRITICAL FIX — remove nested path completely
  admin.profileRef = undefined;

  await admin.save();

  console.log("Admin seeded successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
