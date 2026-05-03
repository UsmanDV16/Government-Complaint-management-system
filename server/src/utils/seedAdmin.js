import bcrypt from "bcryptjs";
import User from "../models/User.js";

export async function seedAdmin() {
  const {
    ADMIN_CNIC,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_NAME,
    ADMIN_USERNAME
  } = process.env;
  if (!ADMIN_CNIC || !ADMIN_EMAIL || !ADMIN_USERNAME) {
    return;
  }
  const normalizedUsername = ADMIN_USERNAME.trim().toLowerCase();
  const existing = await User.findOne({ role: "admin" });
  if (existing) {
    if (!existing.username && normalizedUsername) {
      existing.username = normalizedUsername;
      await existing.save();
      console.log("Updated admin username");
    }
    return;
  }
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD || "Admin@123", 10);
  await User.create({
    name: ADMIN_NAME || "System Admin",
    username: normalizedUsername,
    cnic: ADMIN_CNIC,
    email: ADMIN_EMAIL,
    passwordHash,
    role: "admin",
    isActive: true
  });
  console.log("Seeded admin account");
}
