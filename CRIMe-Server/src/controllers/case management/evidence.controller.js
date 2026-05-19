
import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import Case from "../../models/case.model.js";
import Evidence from "../../models/evidence.model.js";

class EvidenceController {

  static commitEvidence = wrapAsync(async (req, res) => {

    const { id } = req.params; // crime report id
    const { files } = req.body;
    const currentUser = req.user;

    if (!Array.isArray(files) || files.length === 0) {
      throw new apiError(400, "files array is required");
    }

    const caseDoc = await Case.findById(id)
      .select("tenantId citizenId status");

    if (!caseDoc) {
      throw new apiError(404, "Case not found");
    }

    if (caseDoc.status === "ARCHIVED") {
      throw new apiError(400, "Cannot add evidence to an archived case");
    }

    

    if (!currentUser) {
      throw new apiError(401, "Authentication required");
    }

    // ---------------- Authorization ----------------

    if (currentUser.role === "CITIZEN") {

      if (
        !caseDoc.citizenId ||
        caseDoc.citizenId.toString() !== currentUser._id.toString()
      ) {
        throw new apiError(403, "You are not allowed to add evidence to this case");
      }}

      //this check is used so police can add further evidence to case 
      else if (currentUser.role === "POLICE") {
        if (caseDoc.assignedTo?.toString() !== currentUser._id.toString()) {
          throw new apiError(403, "Case not assigned to you");
        }
      } else if (currentUser.role !== "ADMIN") {
        throw new apiError(403, "Not allowed to add evidence");
      }  

    // ---------------- Tenant isolation ----------------

    if (
      currentUser.tenantId &&
      caseDoc.tenantId.toString() !== currentUser.tenantId.toString()
    ) {
      throw new apiError(403, "Cross-tenant access not allowed");
    }

    const evidenceIds = [];

    for (const file of files) {

      const {
        storageKey,
        fileSize,
        sha256Hash,
        fileType
      } = file;

      if (!storageKey || !fileSize || !sha256Hash || !fileType) {
        throw new apiError(400, "Invalid file object");
      }

      const evidence = await Evidence.create({
        tenantId: caseDoc.tenantId,
        caseId: caseDoc._id,
        storageKey,
        fileType,
        fileSize,
        sha256Hash,
        uploadedBy: currentUser._id,
        uploadIp: req.ip,
        storageClass: "STANDARD",
        storageRegion: process.env.AWS_REGION || "us-east-1"
      });

      evidenceIds.push(evidence._id);
    }

    await Case.findByIdAndUpdate(
      caseDoc._id,
      {
        $push: {
          evidenceFiles: { $each: evidenceIds }
        }
      }
    );

    res.status(201).json(
      new apiResponse(
        201,
        { evidenceIds },
        "Evidence committed successfully"
      )
    );
  });

}

export default EvidenceController;
