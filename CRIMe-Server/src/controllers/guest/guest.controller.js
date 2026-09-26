import Case from "../../models/case.model.js";
import CaseUpdate from "../../models/caseUpdate.model.js";
import PoliceStation from "../../models/policeStation.model.js";
import Evidence from "../../models/evidence.model.js";
import User from "../../models/user.model.js";
import NotificationService from "../../services/notification.service.js";
import geminiAIService from "../../services/geminiAI.service.js";
import PDFService from "../../services/pdf.service.js";
import { sendEmail } from "../../services/nodemailer.service.js";
import {
  generateOTP,
  hashOTP,
  compareOTP,
  storeOTP,
  getStoredOTP,
  markOTPVerified,
  invalidateOTP
} from "../../services/otp.service.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import wrapAsync from "../../utils/wrapAsync.js";
import { nanoid } from "nanoid";

// helper function to validate verified session
const validateVerifiedSession = async (sessionId, email) => {
    const storedSession = await getStoredOTP(sessionId);

    if (!storedSession) {
        throw new apiError(
            400,
            "Verification session expired or is invalid. Please request a new OTP."
        );
    }

    if (!storedSession.verified) {
        throw new apiError(
            403,
            "Please verify your email before reporting a case."
        );
    }

    if (storedSession.email !== email) {
        throw new apiError(
            400,
            "The provided email does not match the verified email."
        );
    }

    return storedSession;
};

// helper function to validate guest case access using caseId + trackingToken
const validateGuestCaseAccess = async (caseId, trackingToken) => {
    const caseDoc = await Case.findOne({
        _id: caseId,
        trackingToken,
        "reporter.type": "GUEST",
        isArchived: false
    });

    if (!caseDoc) {
        throw new apiError(404, "Case not found or invalid tracking token");
    }

    return caseDoc;
};

const withTimeout = (promise, ms, label = "operation") =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);

class GuestController {

  // ───── Step 1: Request OTP (sent to guest's email) ─────
  static sendOTP = wrapAsync(async (req, res) => {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new apiError(400, "A valid email is required");
    }

    // Check if email already has an account
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new apiError(400, "This email is already registered. Please login to your account to report a case.");
    }

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const sessionId = nanoid();

    await storeOTP(sessionId, email, hashedOTP);

    return res.status(200).json(
      new apiResponse(200, { sessionId }, "OTP sent to your email")
    );

    try {
      await sendEmail({
        to: email,
        subject: "Your Crime Report Verification Code",
        text: `Your verification code is ${otp}. It expires in 10 minutes.`,
        html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`
      });
    } catch (err) {
      console.error("OTP email failed:", err.message);
      throw new apiError(502, "Failed to send verification email. Please try again.");
    }

    
  });

  static verifyOTP = wrapAsync(async (req, res) => {

    const { sessionId, otp } = req.body;

    const storedOTP = await getStoredOTP(sessionId);

    if (!storedOTP) {
        throw new apiError(400, "OTP expired or session is invalid");
    }

    const isValid = compareOTP(
        otp,
        storedOTP.hashedOTP
    );

    if (!isValid) {
        throw new apiError(400, "Invalid OTP");
    }

    await markOTPVerified(sessionId);

    return res.status(200).json(
        new apiResponse(
            200,
            {
                sessionId,
                email: storedOTP.email
            },
            "OTP verified successfully"
        )
    );

});


  
  static reportCase = wrapAsync(async (req, res) => {

      const {
          sessionId,
          name,
          email,
          phone,
          crimeType,
          description,
          coordinates,
          locationLabel,
          address,
          policeStationId,
          evidenceFileIds,
          guestSessionId
      } = req.body;


      // ───── 1. Validate OTP session ─────

      await validateVerifiedSession(sessionId, email);


      // ───── 2. Validate required fields ─────

      if (!name || !email || !phone) {
          throw new apiError(
              400,
              "name, email and phone are required"
          );
      }

      if (!crimeType || !description || !policeStationId) {
          throw new apiError(
              400,
              "crimeType, description and policeStationId are required"
          );
      }


      // ───── 3. Validate coordinates ─────

      if (
          !Array.isArray(coordinates) ||
          coordinates.length !== 2 ||
          coordinates.some((c) => typeof c !== "number")
      ) {
          throw new apiError(
              400,
              "Valid coordinates [lng, lat] are required"
          );
      }


      // ───── 4. Validate evidenceFileIds ─────

      if (
          evidenceFileIds &&
          (!Array.isArray(evidenceFileIds) ||
              evidenceFileIds.length > 10)
      ) {
          throw new apiError(
              400,
              "evidenceFileIds must be an array with maximum 10 items"
          );
      }


      // If evidence is attached, guestSessionId must exist
      if (
          Array.isArray(evidenceFileIds) &&
          evidenceFileIds.length > 0 &&
          !guestSessionId
      ) {
          throw new apiError(
              400,
              "guestSessionId is required when evidence files are attached"
          );
      }


      // ───── 5. Resolve station + validate evidence ─────

      const [station, evidences] = await Promise.all([
          PoliceStation.findOne({
              _id: policeStationId,
              isActive: true
          }),

          Array.isArray(evidenceFileIds) &&
          evidenceFileIds.length > 0
              ? Evidence.find({
                  _id: { $in: evidenceFileIds },
                  guestSessionId
              })
              : Promise.resolve([])
      ]);


      if (!station) {
          throw new apiError(
              404,
              "Selected police station not found or inactive"
          );
      }


      // ───── 6. Validate evidence ─────

      if (
          Array.isArray(evidenceFileIds) &&
          evidenceFileIds.length > 0
      ) {

          if (evidences.length !== evidenceFileIds.length) {
              throw new apiError(
                  400,
                  "One or more evidence files are invalid or already attached to another case"
              );
          }
      }


      const evidenceIds = evidences.map(
          (evidence) => evidence._id
      );


      // ───── 7. Reporter identity ─────

      const reporter = {
          type: "GUEST",
          fullName: name,
          email,
          phone,
          isVerified: true
      };


      // ───── 8. Create case immediately ─────

      const trackingToken = nanoid(24);

      const newCase = await Case.create({
          tenantId: station.tenantId,
          policeStationId: station._id,

          crimeType,
          description,

          // Safe fallback until Gemini finishes
          aiSummary: description.substring(0, 200),
          severity: "MEDIUM",

          location: {
              type: "Point",
              coordinates
          },

          locationLabel,
          address,

          reporter,

          evidenceFiles: evidenceIds,

          trackingToken,

          status: "PENDING"
      });


      // ───── 9. Link evidence to case ─────

      if (evidenceIds.length > 0) {

          await Evidence.updateMany(
              {
                  _id: { $in: evidenceIds }
              },
              {
                  $set: {
                      caseId: newCase._id,
                      tenantId: newCase.tenantId
                  }
              }
          );
      }


      // ───── 10. Respond immediately ─────

      res.status(201).json(
          new apiResponse(
              201,
              newCase,
              "Crime reported successfully"
          )
      );


      // ───── 11. Background: invalidate OTP ─────

      (async () => {
          try {

              await invalidateOTP(sessionId);

          } catch (err) {

              console.error(
                  `Failed to invalidate OTP session ${sessionId}:`,
                  err.message
              );

          }
      })();


      // ───── 12. Background: AI classification ─────

      (async () => {
          try {

              const result =
                  await geminiAIService.generateCrimeAnalysis(
                      description,
                      crimeType,
                      address
                  );


              await Case.findByIdAndUpdate(
                  newCase._id,
                  {
                      aiSummary: result.summary,
                      severity: result.severity
                  }
              );

          } catch (err) {

              console.error(
                  `AI classification failed for case ${newCase._id}:`,
                  err.message
              );

          }
      })();


      // ───── 13. Background: receipt PDF ─────

      (async () => {
          try {

              const receiptUrl =
                  await PDFService.generateReceipt(newCase);

              await Case.findByIdAndUpdate(
                  newCase._id,
                  {
                      receiptPdf: receiptUrl,
                      guestDownloadAllowed: false
                  }
              );

          } catch (err) {

              console.error(
                  `Receipt PDF generation failed for case ${newCase._id}:`,
                  err.message
              );

          }
      })();


      // ───── 14. Background: station-head notification ─────

      if (station.stationHead) {

          (async () => {

              try {

                  await NotificationService.send({
                      tenantId: station.tenantId,
                      userId: station.stationHead,

                      type: "new_case_reported",

                      title: "New Case Reported",

                      message:
                          `A new case (${newCase.caseId}) has been reported ` +
                          `at ${station.name} by ${reporter.fullName}`,

                      channels: ["inapp"]
                  });

              } catch (err) {

                  console.error(
                      `Notification failed for case ${newCase._id}:`,
                      err.message
                  );

              }

          })();

      }

  });


  static trackCase = wrapAsync(async (req, res) => {
    const { caseId } = req.params;
    const { trackingToken } = req.query;
    
    if (!caseId || !trackingToken) {
      throw new apiError(400, "caseId and trackingToken are required as query params");
    }

    const caseDoc = await Case.findOne({
    caseId,
    trackingToken,
    "reporter.type": "GUEST"
  }).select(
    "_id caseId status crimeType severity aiSummary createdAt updatedAt address locationLabel"
  );

    if (!caseDoc) {
      throw new apiError(404, "Case not found. Please check your case ID and tracking token.");
    }

    return res.status(200).json(
      new apiResponse(200, caseDoc, "Case details fetched")
    );
  });

  // GET case details for guest using caseId + trackingToke
  static caseDetails = wrapAsync(async (req, res) => {
      const { caseId } = req.params;
      const { trackingToken } = req.query;

      if (!caseId || !trackingToken) {
          throw new apiError(
              400,
              "caseId and trackingToken are required"
          );
      }

      const caseDoc = await validateGuestCaseAccess(
          caseId,
          trackingToken
      );

      const caseDetails = await Case.findOne({
          _id: caseDoc._id
      })
          .populate('assignedTo', 'fullName badgeNumber email phone')
          .populate('assignedBy', 'fullName email phone')
          .populate('policeStationId', 'name address contactNumber email')
          .populate(
              'evidenceFiles',
              'fileUrl originalFileName fileType mimeType fileSize resourceType uploadedBy createdAt'
          )
          .lean();

      if (!caseDetails) {
          throw new apiError(404, "Case not found");
      }

      return res.status(200).json(
          new apiResponse(
              200,
              caseDetails,
              "Case details fetched successfully"
          )
      );
  });



  // GET case updates for guest using caseId + trackingToken
  static caseUpdates = wrapAsync(async (req, res) => {
    const { caseId } = req.params;
    const { trackingToken } = req.query;
    
    if (!caseId || !trackingToken) {
      throw new apiError(400, "caseId and trackingToken are required");
    }

    const caseDoc = await validateGuestCaseAccess(caseId, trackingToken);

    // Get updates with visibility filtering (same as citizen)
    const updates = await CaseUpdate.find({ 
      caseId: caseDoc._id,
      $or: [
        { updaterRole: "GUEST" },
        { visibility: "PUBLIC" }
      ]
    })
    .populate('updatedBy', 'fullName badgeNumber')
    .sort({ createdAt: -1 });

    return res.status(200).json(
      new apiResponse(200, updates, "Case updates fetched successfully")
    );
  });

  // POST add note for guest using caseId + trackingToken
  static addNote = wrapAsync(async (req, res) => {
    const { caseId } = req.params;
    const { trackingToken, note } = req.body;

    if (!caseId || !trackingToken) {
      throw new apiError(400, "caseId and trackingToken are required");
    }

    if (!note) {
      throw new apiError(400, "Note is required");
    }

    const caseDoc = await validateGuestCaseAccess(caseId, trackingToken);

    // Check if case is under investigation
    if (caseDoc.status !== "UNDER_INVESTIGATION") {
      throw new apiError(403, `Cannot add note to a ${caseDoc.status} case. Notes only allowed during UNDER_INVESTIGATION`);
    }

    // Check if guest updates are allowed
    if (!caseDoc.allowCitizenUpdates) {
      throw new apiError(403, "Investigating officer has disabled public notes for this case");
    }

    const updateData = {
      tenantId: caseDoc.tenantId,
      caseId: caseDoc._id,
      updaterRole: "GUEST",
      updateType: "NOTE",
      note,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    };

    const newUpdate = await CaseUpdate.create(updateData);

    res.status(201).json(
      new apiResponse(201, newUpdate, "Information added successfully")
    );

    // Background notifications
    setImmediate(async () => {
      const tasks = [];

      if (caseDoc.assignedTo) {
        tasks.push(NotificationService.send({
          tenantId: caseDoc.tenantId,
          userId: caseDoc.assignedTo,
          type: "citizen_added_information",
          title: "New Information Added",
          message: `Guest has added information to case ${caseDoc.caseId}`,
          channels: ["inapp"]
        }));
      }

      if (caseDoc.assignedBy) {
        tasks.push(NotificationService.send({
          tenantId: caseDoc.tenantId,
          userId: caseDoc.assignedBy,
          type: "citizen_added_information",
          title: "New Information Added",
          message: `Guest has added information to case ${caseDoc.caseId}`,
          channels: ["inapp"]
        }));
      }

      await Promise.allSettled(tasks);
    });
  });

  // Nearest station — auto-resolve only, no manual override
  static suggestNearestStations = wrapAsync(async (req, res) => {
    const { lng, lat } = req.query;

    if (!lng || !lat) {
      throw new apiError(400, "lng and lat are required");
    }

    const longitude = Number(lng);
    const latitude = Number(lat);

    if (isNaN(longitude) || isNaN(latitude)) {
      throw new apiError(400, "lng and lat must be valid numbers");
    }

    let stations = await PoliceStation.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distanceMeters",
          maxDistance: 50000,
          spherical: true,
          query: { isActive: true }
        }
      },
      { $limit: 1 },
      {
        $project: {
          name: 1,
          code: 1,
          address: 1,
          city: 1,
          location: 1,
          tenantId: 1,
          distance: { $round: [{ $divide: ["$distanceMeters", 1000] }, 2] }
        }
      }
    ]);

    // Fallback — no station within 50km, return single closest active station regardless of distance
    if (stations.length === 0) {
      const fallback = await PoliceStation.findOne({ isActive: true })
        .select("name code address city location tenantId");
      if (fallback) stations = [fallback];
    }

    if (stations.length === 0) {
      throw new apiError(404, "No active police stations available");
    }

    return res.status(200).json(
      new apiResponse(200, { 
        stations: stations,
        total: stations.length,
        searchCenter: { latitude, longitude },
        radiusKm: 50
      }, "Nearest station resolved")
    );
  });
}

export default GuestController;