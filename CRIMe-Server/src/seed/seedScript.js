import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

dotenv.config();

const createSuperAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error("MONGO_URI is not configured");
        }

        await mongoose.connect(mongoUri);

        console.log("MongoDB connected");

        // 1. Check whether a Super Admin already exists
        const existingSuperAdmin = await User.findOne({
            isSuperAdmin: true
        });

        if (existingSuperAdmin) {
            console.log(
                `Super Admin already exists: ${existingSuperAdmin.email}`
            );
            return;
        }

        // 2. Check whether the intended email is already being used
        const existingEmail = await User.findOne({
            email: process.env.SUPER_ADMIN_EMAIL.toLowerCase()
        });

        if (existingEmail) {
            console.error(
                `A user already exists with email: ${existingEmail.email}`
            );

            console.error(
                `Role: ${existingEmail.role}, isSuperAdmin: ${existingEmail.isSuperAdmin}`
            );

            return;
        }

        // 3. Validate required environment variables
        if (!process.env.SUPER_ADMIN_EMAIL) {
            throw new Error("SUPER_ADMIN_EMAIL is missing");
        }

        if (!process.env.SUPER_ADMIN_PASSWORD) {
            throw new Error("SUPER_ADMIN_PASSWORD is missing");
        }

        if (!process.env.SUPER_ADMIN_PHONE) {
            throw new Error("SUPER_ADMIN_PHONE is missing");
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(
            process.env.SUPER_ADMIN_PASSWORD,
            10
        );

        // 5. Hash national ID
        // Use the same national ID that was used for the original account.
        const nationalIdHash = await bcrypt.hash(
            "3610420064967",
            10
        );

        // 6. Create Super Admin
        const superAdmin = await User.create({
            tenantId: null,

            fullName: "Super Admin",

            email: process.env.SUPER_ADMIN_EMAIL
                .trim()
                .toLowerCase(),

            phone: process.env.SUPER_ADMIN_PHONE
                .trim(),

            password: hashedPassword,

            profilePictureUrl:
                process.env.SUPER_ADMIN_PROFILE_PIC || null,

            gender: "MALE",

            role: "ADMIN",

            isSuperAdmin: true,

            status: "APPROVED",

            dateOfBirth: new Date("2001-08-15"),

            idType: "NATIONAL_ID",

            nationalIdHash,

            authProvider: "LOCAL",

            isEmailVerified: true
        });

        console.log("\n=================================");
        console.log("Super Admin recovered successfully");
        console.log("=================================");
        console.log("ID:", superAdmin._id);
        console.log("Email:", superAdmin.email);
        console.log("Role:", superAdmin.role);
        console.log("isSuperAdmin:", superAdmin.isSuperAdmin);
        console.log("Status:", superAdmin.status);
        console.log("Tenant:", superAdmin.tenantId);

    } catch (error) {
        console.error("\nFailed to recover Super Admin:");
        console.error(error);
        process.exitCode = 1;

    } finally {
        await mongoose.connection.close();
    }
};

createSuperAdmin();