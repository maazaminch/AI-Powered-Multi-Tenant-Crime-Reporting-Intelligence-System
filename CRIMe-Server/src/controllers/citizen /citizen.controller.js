import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import Case from "../../models/case.model.js";
import CaseUpdate from "../../models/caseUpdate.model.js";
import NotificationService from "../../services/notification.service.js";
import PoliceStation from "../../models/policeStation.model.js";
import Evidence from "../../models/evidence.model.js";
import geminiAIService from "../../services/geminiAI.service.js";


class CitizenController {

    static dashboardStats = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "CITIZEN") {
            throw new apiError(403, "Only citizens can access this endpoint");
        }

        const filter = {
            "reporter.type": "CITIZEN",
            "reporter.citizenId": currentUser._id,
            isArchived: false
        };

        const [
            totalCases,
            pendingCases,
            assignedCases,
            underInvestigationCases,
            resolvedCases,
            closedCases
        ] = await Promise.all([
            Case.countDocuments(filter),
            Case.countDocuments({ ...filter, status: "PENDING" }),
            Case.countDocuments({ ...filter, status: "ASSIGNED" }),
            Case.countDocuments({ ...filter, status: "UNDER_INVESTIGATION" }),
            Case.countDocuments({ ...filter, status: "RESOLVED" }),
            Case.countDocuments({ ...filter, status: "CLOSED" })
        ]);

        res.status(200).json(
            new apiResponse(
                200,
                {
                    totalCases,
                    pendingCases,
                    assignedCases,
                    underInvestigationCases,
                    resolvedCases,
                    closedCases
                },
                "Dashboard stats fetched successfully")
        );
    });

    // POST /citizen/citizen-report-crime - Submit crime report as authenticated citizen
    static reportCase = wrapAsync(async (req, res) => {

    const currentUser = req.user;

    const {
        crimeType,
        description,
        coordinates,       // [lng, lat] — from map pin/GPS
        locationLabel,     // auto reverse-geocoded label
        address,           // optional — citizen-refined precise location
        policeStationId,
        evidenceFileIds    // optional — uploaded before final submit
    } = req.body;


    // ───── 1. Required field validation ─────

    if (!crimeType || !description || !policeStationId) {
        throw new apiError(
            400,
            "crimeType, description and policeStationId are required"
        );
    }


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


    // Validate evidenceFileIds if provided
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


    // ───── 2. Validate evidence ownership ─────

    let evidenceIds = [];

    if (
        Array.isArray(evidenceFileIds) &&
        evidenceFileIds.length > 0
    ) {
        const evidences = await Evidence.find({
            _id: { $in: evidenceFileIds },
            uploadedBy: currentUser._id,
            caseId: null
        });

        if (evidences.length !== evidenceFileIds.length) {
            throw new apiError(
                400,
                "One or more evidence files are invalid or already attached to another case"
            );
        }

        evidenceIds = evidences.map((e) => e._id);
    }


    // ───── 3. Resolve station → tenant ─────

    // Never trust tenantId from the client.
    const station = await PoliceStation.findOne({
        _id: policeStationId,
        isActive: true
    });

    if (!station) {
        throw new apiError(
            404,
            "Selected police station not found or inactive"
        );
    }


    // ───── 4. Reporter identity ─────

    const reporter = {
        type: "CITIZEN",
        citizenId: currentUser._id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone,
        isVerified: true
    };


    // ───── 5. Create case immediately ─────

    // AI runs in the background, so use safe fallback values initially.
    const newCase = await Case.create({
        tenantId: station.tenantId,
        policeStationId: station._id,

        crimeType,
        description,

        aiSummary: description.substring(0, 200),
        severity: "MEDIUM",
        aiClassificationStatus: "PENDING",

        location: {
            type: "Point",
            coordinates
        },

        locationLabel,
        address,

        reporter,

        evidenceFiles: evidenceIds,

        status: "PENDING"
    });


    // ───── 6. Link uploaded evidence to this case ─────

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


    // ───── 7. Respond immediately ─────

    // Everything required to successfully create the case is complete.
    // The citizen does NOT wait for Gemini or notifications.
    res.status(201).json(
        new apiResponse(
            201,
            newCase,
            "Crime reported successfully"
        )
    );


    // ───── 8. Background: AI classification ─────

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
                    severity: result.severity,
                    aiClassificationStatus: "COMPLETE"
                }
            );

        } catch (err) {

            console.error(
                `AI classification failed for case ${newCase._id}:`,
                err.message
            );


            // Case already exists, so AI failure must NOT affect submission.
            await Case.findByIdAndUpdate(
                newCase._id,
                {
                    aiClassificationStatus: "FAILED"
                }
            ).catch((updateErr) => {

                console.error(
                    `Failed to update AI status for case ${newCase._id}:`,
                    updateErr.message
                );

            });
        }
    })();


    // ───── 9. Background: Station-head notification ─────

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



    //it suggests nearest police stations based on coordinates while reporting a case
    static suggestNearestStations = wrapAsync(async (req, res) => {
    const { lng, lat } = req.query;

    if (!lng || !lat) throw new apiError(400, "lng and lat are required");

    console.log('Searching for stations near:', lng, lat);

    let stations = await PoliceStation.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: 50000 // 50km cap for testing
        }
      }
    })
    .limit(10)
    .select("name code address city location");

    console.log('Found stations with geospatial query:', stations.length);

    // Fallback: if no stations found with geospatial, return all active stations
    if (stations.length === 0) {
      console.log('No stations found with geospatial query, fetching all active stations as fallback');
      stations = await PoliceStation.find({
        isActive: true
      })
      .limit(20)
      .select("name code address city location");
      console.log('Fallback: Found stations:', stations.length);
    }

    return res.status(200).json(
      new apiResponse(200, stations, "Nearest stations fetched")
    );
    });


    // GET /citizen/my-cases - Get all cases by logged-in citizen
    static citizenCases = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "CITIZEN") {
            throw new apiError(403, "Only citizens can access this endpoint");
        }

        const { 
            status,  
            search, 
            page = 1,
            limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        
        const filter = {
            "reporter.type": "CITIZEN",
            "reporter.citizenId": currentUser._id,
            isArchived: false,
            ...req.tenantFilter
        };

        // Status filter
        if (status) {
            filter.status = status;
        }

        // Search filter (caseId, crimeType, description)
        if (search) {
            filter.$or = [
                { caseId: { $regex: search, $options: 'i' } },
                { crimeType: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [cases, totalCases] = await Promise.all([
            Case.find(filter)
                .populate('assignedTo', 'fullName badgeNumber')
                .populate('assignedBy', 'fullName')
                .populate('policeStationId', 'name address')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Case.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCases / parseInt(limit));

        res.status(200).json(
            new apiResponse(200, {
                cases,
                totalCases,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    currentPage: page,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }, "My reports fetched successfully")
        );
    });

    // GET /citizen/case/:id - Get case details with visibility filtering
    static caseDetails = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        if (currentUser.role !== "CITIZEN") {
            throw new apiError(403, "Only citizens can access this endpoint");
        }

        const filter = {
            _id: caseId,
            "reporter.type": "CITIZEN",
            "reporter.citizenId": currentUser._id,
            isArchived: false
        };

        const caseDetails = await Case.findOne(filter)
            .populate('assignedTo', 'fullName badgeNumber email phone')
            .populate('assignedBy', 'fullName email phone')
            .populate('policeStationId', 'name email contactNumber code')
            .populate('evidenceFiles', 'fileUrl originalFileName fileType mimeType fileSize resourceType uploadedBy createdAt')
            .lean();

        if (!caseDetails) {
            throw new apiError(404, "Case not found or you don't have access to this case");
        }

        
        res.status(200).json(
            new apiResponse(
                200,
                caseDetails,
                "Case details fetched successfully"
            )
        );
    });

    static caseUpdates = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        if (currentUser.role !== "CITIZEN") {
            throw new apiError(403, "Only citizens can access this endpoint");
        }

        const filter = {
            _id: caseId,
            "reporter.type": "CITIZEN",
            "reporter.citizenId": currentUser._id,
            isArchived: false
        };

        const caseDoc = await Case.findOne(filter).lean();
        if (!caseDoc) {
            throw new apiError(404, "Case not found or you don't have access to this case");
        }

        // Get updates with visibility filtering
        // Citizens can only see: 
        // 1. Their own updates (updaterRole === "CITIZEN")
        // 2. PUBLIC updates (visibility === "PUBLIC")
        const updates = await CaseUpdate.find({ 
            caseId: caseDoc._id,
            $or: [
                { updaterRole: "CITIZEN" },
                { visibility: "PUBLIC" }
            ]
        })
        .populate('updatedBy', 'fullName badgeNumber')
        .sort({ createdAt: -1 });


        if (!updates) {
            throw new apiError(404, "Case updates not found");
        }

        res.status(200).json(
            new apiResponse(
                200,
                updates,
                "Case updates fetched successfully"
            )
        );
    })

    // POST /citizen/case/:id/add-note - Add notes/information to case
    static addNote = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { note } = req.body;
        const currentUser = req.user;

        if (currentUser.role !== "CITIZEN") {
            throw new apiError(403, "Only citizens can access this endpoint");
        }

        if (!note) {
            throw new apiError(400, "Note is required");
        }

        const filter = {
            _id: caseId,
            "reporter.type": "CITIZEN",
            "reporter.citizenId": currentUser._id,
            isArchived: false,
            ...req.tenantFilter
        };

        const caseDoc = await Case.findOne(filter).lean();
        if (!caseDoc) {
            throw new apiError(404, "Case not found or you don't have access to this case");
        }

        // Check if case is under investigation
        if (caseDoc.status !== "UNDER_INVESTIGATION") {
            throw new apiError(403, `Cannot add note to a ${caseDoc.status} case. Notes only allowed during UNDER_INVESTIGATION`);
        }

        // Check if citizen updates are allowed
        if (!caseDoc.allowCitizenUpdates) {
            throw new apiError(403, "Investigating officer has disabled public notes for this case");
        }

        const updateData = {
            tenantId: caseDoc.tenantId,
            caseId: caseDoc._id,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType: "NOTE",
            note,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        };

        const newUpdate = await CaseUpdate.create(updateData);

        res.status(201).json(
            new apiResponse(201, newUpdate, "Information added successfully")
        );

        const afterResponse = async () => {
            const tasks = [];

            // Notify assigned officer
            if (caseDoc.assignedTo) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: caseDoc.assignedTo,
                    type: "citizen_added_information",
                    title: "New Information Added",
                    message: `Citizen has added information to case ${caseDoc.caseId}`,
                    channels: ["inapp"]
                }));
            }

            // Notify station head
            if (caseDoc.assignedBy) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: caseDoc.assignedBy,
                    type: "citizen_added_information",
                    title: "New Information Added",
                    message: `Citizen has added information to case ${caseDoc.caseId}`,
                    channels: ["inapp"]
                }));
            }

            await Promise.all(tasks);
        };

        afterResponse().catch(err => console.error("Background notification sending failed", err));
    });



}

export default CitizenController;

