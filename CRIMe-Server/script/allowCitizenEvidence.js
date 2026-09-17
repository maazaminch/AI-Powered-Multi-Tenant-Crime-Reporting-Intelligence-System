// scripts/migrateAllowCitizenEvidence.js
import mongoose from "mongoose";
import Case from "../src/models/case.model.js";
import dotenv from "dotenv";
dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);

  const result = await Case.updateMany(
    { allowCitizenEvidenceUpload: { $exists: false } },
    { $set: { allowCitizenEvidenceUpload: true } }
  );

  console.log(`Updated ${result.modifiedCount} case(s)`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});