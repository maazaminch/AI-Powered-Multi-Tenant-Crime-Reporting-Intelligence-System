//======================================================
// CLEANUP SEED DATA
//======================================================

import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";

import User from "../src/models/user.model.js";
import Tenant from "../src/models/tenant.model.js";
import PoliceStation from "../src/models/policeStation.model.js";
import Case from "../src/models/case.model.js";

const TENANT_NAMES = [
    "Lahore",
    "Karachi", 
    "Islamabad",
    "Peshawar",
    "Quetta"
];

const cleanupSeedData = async () => {
    try {
        console.log("\n=================================================");
        console.log("CLEANING UP SEED DATA");
        console.log("=================================================\n");

        await connectDB();
        console.log("Database Connected Successfully.\n");

        // Find tenants to delete
        const tenantsToDelete = await Tenant.find({
            name: { $in: TENANT_NAMES }
        });

        if (tenantsToDelete.length === 0) {
            console.log("No seed tenants found to delete.");
            return;
        }

        const tenantIds = tenantsToDelete.map(t => t._id);
        console.log(`Found ${tenantsToDelete.length} tenants to delete:`);
        tenantsToDelete.forEach(t => console.log(`  - ${t.name}`));

        // Delete cases for these tenants
        const casesDeleted = await Case.deleteMany({
            tenantId: { $in: tenantIds }
        });
        console.log(`\nDeleted ${casesDeleted.deletedCount} cases`);

        // Delete police stations for these tenants
        const stationsDeleted = await PoliceStation.deleteMany({
            tenantId: { $in: tenantIds }
        });
        console.log(`Deleted ${stationsDeleted.deletedCount} police stations`);

        // Delete users for these tenants
        const usersDeleted = await User.deleteMany({
            tenantId: { $in: tenantIds }
        });
        console.log(`Deleted ${usersDeleted.deletedCount} users`);

        // Delete the tenants
        const tenantsDeleted = await Tenant.deleteMany({
            name: { $in: TENANT_NAMES }
        });
        console.log(`Deleted ${tenantsDeleted.deletedCount} tenants`);

        console.log("\n=================================================");
        console.log("CLEANUP COMPLETED SUCCESSFULLY");
        console.log("=================================================\n");

        await mongoose.connection.close();
        console.log("Database Connection Closed.\n");

    } catch (error) {
        console.error("\nCLEANUP FAILED.\n");
        console.error(error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

cleanupSeedData();
