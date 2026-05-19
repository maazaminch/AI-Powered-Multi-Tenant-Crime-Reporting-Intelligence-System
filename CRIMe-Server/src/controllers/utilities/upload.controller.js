import wrapAsync from "../../utils/wrapAsync.js";
import generatePresignedUrl from "../../services/s3PreSignedUrl.service.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import CrimeReport from "../../models/case.model.js";

class UploadController {

  // Public profile upload for registration (no auth required)
  static getPublicProfileUploadUrl = wrapAsync(async (req, res) => {

    const { filename, type } = req.body;

    if (!filename || !type) {
      throw new apiError(400, "filename and type are required");
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(type)) {
      throw new apiError(400, "Invalid file type for profile picture");
    }

    // Use "temp" as referenceId for registration uploads
    const result = await generatePresignedUrl(
      filename,
      type,
      "profile",
      "temp"
    );

    return res
      .status(200)
      .json(new apiResponse(200, result
        , "Upload URL, file url and storageKey generated for profilePic"));
  });

  //that fields comes from frontend and is used to generate a presigned url
  static getUploadUrl = wrapAsync(async (req, res) => {

    const { filename, type, purpose, referenceId } = req.body;
    const currentUser = req.user;

    if (!filename || !type || !purpose) {
      throw new apiError(400, "filename, type and purpose are required");
    }

    const allowedTypes = {
      profile: ["image/png", "image/jpeg", "image/webp"],
      evidence: [
        "image/png",
        "image/jpeg",
        "video/mp4",
        "audio/mpeg",
        "application/pdf",
        "application/zip"
      ]
    };

    if (!allowedTypes[purpose]?.includes(type)) {
      throw new apiError(400, `Invalid file type for ${purpose}`);
    }

    // -----------------------------
    // PROFILE upload
    // -----------------------------
    if (purpose === "profile") {

      if (!currentUser) {
        throw new apiError(401, "Authentication required");
      }

      const result = await generatePresignedUrl(
        filename,
        type,
        purpose,
        currentUser.id
      );

      return res
        .status(200)
        .json(new apiResponse(200, result
          , "Upload URL, file url and storageKey generated for profilePic"));
    }

    // -----------------------------
    // EVIDENCE upload
    // -----------------------------
    if (purpose === "evidence") {

      if (!currentUser) {
        throw new apiError(401, "Login required to upload evidence");
      }

      if (!referenceId) {
        throw new apiError(400, "referenceId (case id) is required for evidence");
      }

      const crimeReport = await CrimeReport.findById(referenceId)
        .select("citizenId tenantId status");

      if (!crimeReport) {
        throw new apiError(404, "Crime report not found");
      }

      // Tenant isolation
      if (
        currentUser.tenantId &&
        crimeReport.tenantId.toString() !== currentUser.tenantId.toString()
      ) {
        throw new apiError(403, "Cross-tenant upload is not allowed");
      }

      // Access control
      if (currentUser.role === "CITIZEN") {

        if (
          !crimeReport.citizenId ||
          crimeReport.citizenId.toString() !== currentUser._id.toString()
        ) {
          throw new apiError(403, "You are not allowed to upload evidence for this case");
        }

        }
        //this check is used so police can add further evidence to the case 
        else if (currentUser.role === "POLICE") {
          if (crimeReport.assignedTo?.toString() !== currentUser._id.toString()) {
            throw new apiError(403, "Case not assigned to you");
          }
        } else if (currentUser.role !== "ADMIN") {
          throw new apiError(403, "Not allowed to add evidence");
        } 


        
      // Optional: block uploads after case closed
      if (crimeReport.status === "RESOLVED" || crimeReport.status === "ARCHIVED") {
        throw new apiError(400, "Cannot upload evidence for a resolved or archived case");
      }

      const result = await generatePresignedUrl(
        filename,
        type,
        purpose,
        referenceId
      );

      return res
        .status(200)
        .json(new apiResponse(200, result,
           "Upload URL, file url and storageKey generated for evidence"));
    }

    throw new apiError(400, "Invalid purpose");
  });
}

export default UploadController;
