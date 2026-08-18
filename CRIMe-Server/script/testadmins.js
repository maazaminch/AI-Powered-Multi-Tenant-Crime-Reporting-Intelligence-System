// seedTestAdmins.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/user.model.js";
import "../src/config/env.js";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash("Test@1234", 10);
  const hashedNationalId = await bcrypt.hash("35202-1234567-1", 10); // dummy CNIC

  const baseFields = {
    password: hashedPassword,
    gender: "MALE",
    role: "ADMIN",
    isSuperAdmin: false,
    dateOfBirth: new Date("1995-01-01"),
    idType: "NATIONAL_ID",
    nationalIdHash: hashedNationalId,
    failedLoginAttempts: 0,
    isArchived: false,
    isStationHead: false,
    authProvider: "LOCAL",
    isEmailVerified: false
  };

  await User.insertMany([
    {
      ...baseFields,
      fullName: "Test Unassigned Admin",
      email: "unassigned.admin@test.com",
      phone: "03001234567",
      status: "APPROVED",
      isApproved: true,
      tenantId: null
    },
    {
      ...baseFields,
      fullName: "Test Pending Admin",
      email: "pending.admin@test.com",
      phone: "03007654321",
      status: "PENDING",
      isApproved: false,
      tenantId: null
    },
    {
      ...baseFields,
      fullName: "Test Approved Assigned Admin",
      email: "approved.admin@test.com",
      phone: "03009998888",
      status: "APPROVED",
      isApproved: true,
      tenantId: null
    }
  ]);

  console.log("✅ Seeded 3 test admins");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});