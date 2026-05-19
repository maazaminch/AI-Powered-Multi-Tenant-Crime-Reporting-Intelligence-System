import mongoose from "mongoose";
import generateTenantCode from "../services/tenantCode.service.js";;

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, //Multan
  region: {type: String, required: true },  //Punjab
  code: { type: String, unique: true, required: true, immutable: true }, //MULTAN-PUN
  type: { type: String, enum: ["CITY", "DEPARTMENT"], required: true },
  isActive: { type: Boolean, default: true },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

},{timestamps: true});



TenantSchema.pre('validate', function(next) {
  try {
    if (!this.code) {
      // console.log("NAME:", this.name);
      // console.log("REGION:", this.region);

      this.code = generateTenantCode(this.name, this.region);

      console.log("GENERATED CODE:", this.code);
    }
    next();
  } catch (err) {
    console.error("ACTUAL ERROR:", err);
  }
});



// TenantSchema.pre('validate', function(next) {
//   try {
//     if(!this.code) {
//     this.code = generateTenantCode(this.name, this.region);
//     }
//     next();

//   } catch (err) {
//     throw new apiError(400, 'Failed to generate tenantCode')
//   }
// })

export default mongoose.model("Tenant", TenantSchema);
