import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

dotenv.config();

// Run script: node scripts/createSuperAdmin.js
const createSuperAdmin = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crime_saas_db";
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // 2️⃣ Check if super admin already exists
    const existing = await User.findOne({ isSuperAdmin: true });
    if (existing) {
      console.log("⚠️ Super Admin already exists:", existing.email);
      process.exit(0);
    }

    // 3️⃣ Hash the password and national ID
    const password = process.env.SUPER_ADMIN_PASSWORD;
    console.log("PASSWORD FROM ENV:", process.env.SUPER_ADMIN_PASSWORD);
    const hashedPassword = await bcrypt.hash(password, 10);
    const nationalIdHash = await bcrypt.hash("3610420064967", 10);

    // 4️⃣ Set profile picture default if not provided
    const profilePic = process.env.SUPER_ADMIN_PROFILE_PIC || "https://cdn.example.com/default-profile.png";

    // 5️⃣ Create Super Admin
    const superAdmin = await User.create({
      tenantId: null,
      fullName: "Super Admin",
      email: process.env.SUPER_ADMIN_EMAIL || "crimereportingsystem8000@gmail.com",
      phone: process.env.SUPER_ADMIN_PHONE || "03136354666",
      password: hashedPassword,
      profilePictureUrl: profilePic,
      gender: "MALE",
      role: "ADMIN",         // keep "admin" in role enum, superAdmin is flag
      isSuperAdmin: true,
      status: "APPROVED",
      isApproved: true,
      dateOfBirth: new Date("2001-08-15"),
      idType: "NATIONAL_ID",
      nationalIdHash,
    });

    console.log("✅ Super Admin created successfully:", superAdmin.email);
    process.exit(0);

  } catch (err) {
    console.error("❌ Error creating super admin:", err);
    process.exit(1);
  }
};

createSuperAdmin();
