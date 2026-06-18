import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import Case from "../../models/case.model.js";
import User from "../../models/user.model.js";
import Tenant from "../../models/tenant.model.js";
import CaseUpdate from "../../models/caseUpdate.model.js";
import NotificationService from "../../services/notification.service.js";
import PDFService from "../../services/pdf.service.js";
import geminiAIService from "../../services/geminiAI.service.js";
import escapeRegex from "../../utils/escapeRegex.js";
import mongoose from "mongoose";


class CaseController {
    
    

    static createFullCaseController = wrapAsync(async(req, res) => {
            const {crimeType, description, location, evidenceFiles} = req.body;
            const currentUser = req.user;
    
            //tenant isolation
            const tenant = await Tenant.findById(currentUser.tenantId);
            if(!tenant || !tenant.isActive){
                throw new apiError(404, "Tenant not found or inactive");
            }             
          
            if(currentUser.role !== "CITIZEN"){
                throw new apiError(403, "Only citizens can create cases");
            }
    
    
            //crime type
            const allowedCrimeTypes = ["THEFT","ROBBERY","ASSAULT","MURDER","DOMESTIC_VIOLENCE",
                "CYBER_CRIME","KIDNAPPING","FRAUD","DRUG_OFFENSE",
                "HARASSMENT","TRAFFIC_VIOLATION","OTHER"]
            if(!allowedCrimeTypes.includes(crimeType)){
                throw new apiError(400, "Invalid crime type");
            }
            
            //gemini api error fix needed
            let aiDescription = description;
            let severity = "LOW";
            let aiSummary = "";

            try {
            aiDescription = await geminiAIService.generateDescription(description);

            const [sev, summary] = await Promise.all([
                geminiAIService.generateSeverity(aiDescription),
                geminiAIService.generateSummary(
                aiDescription,
                crimeType,
                location,
                evidenceFiles || []
                )
            ]);

            severity = sev;
            aiSummary = summary;

            } catch (err) {
            console.error("AI failed:", err);
            }

            // const aiDescription = await geminiAIService.generateDescription(description);

            // const [sev, summary] = await Promise.all([
            //     geminiAIService.generateSeverity(aiDescription),
            //     geminiAIService.generateSummary(
            //     aiDescription,
            //     crimeType,
            //     location,
            //     evidenceFiles || []
            //     )
            // ]);

            // const severity = sev;
            // const aiSummary = summary;



            //location
            if(!location || !location.coordinates || location.coordinates.length !== 2){
                throw new apiError(400, "Valid location must be selected on map");
            }
    
    
            const newCase = await Case.create({
                tenantId: currentUser.tenantId,
                citizenId: currentUser._id,
                location: {
                    type: "Point",
                    coordinates: location.coordinates
                },
                crimeType,
                evidenceFiles: evidenceFiles || [],
                severity,
                description : aiDescription,
                aiSummary,
                status: "PENDING",
            })
            if(!newCase) throw new apiError(400, "Case not created")
    
    
            //Notification Service
            const admins = await User.find({
                tenantId: currentUser.tenantId, 
                role: 'ADMIN', 
                status: 'APPROVED', 
                isApproved: true,
                isSuspended: false
            })
            await Promise.all(
                admins.map(admin =>
                    NotificationService.send({
                    tenantId: currentUser.tenantId,
                    userId: admin._id,
                    type: 'full_case_submission',
                    title: 'New Full Case Submitted',
                    message: `An full case has been submitted by ${currentUser.fullName}`,
                    channels: ['inapp']
                    })
                )
                );

                // Registered → in-app notification
                await NotificationService.send({
                    tenantId: currentUser.tenantId,
                    userId: currentUser._id,
                    type: "full_case_submission",
                    title: "Full Case Submitted",
                    message: `Your full case has been submitted successfully`,
                    channels: ["inapp"]
                })
    
            //Pdf
            try {
                const filePath = await PDFService.generateReceipt(newCase);
                newCase.receiptPdf = filePath;
                await newCase.save();
            } catch (err) {
                console.error("Receipt PDF generation failed:", err);
            }
    
            return res.status(200).json(new apiResponse(200, newCase, "Case created successfully"))
    })
    static createAnonymousCaseController = wrapAsync(async(req, res) => {
            const {tenantName, reporterName, reporterEmail, reporterPhone, 
                crimeType, description, location, evidenceFiles} = req.body;
            
    
            //tenant isolation
            const tenant = await Tenant.findOne({name: tenantName});
            if(!tenant || !tenant.isActive){
                throw new apiError(404, "Tenant not found or inactive");
            }
            if(!reporterName || !reporterEmail || !reporterPhone) {
                throw new apiError(400, "Missing reporter information");
            }
            
            //crime type
            const allowedCrimeTypes = ["THEFT","ROBBERY","ASSAULT","MURDER","DOMESTIC_VIOLENCE",
                "CYBER_CRIME","KIDNAPPING","FRAUD","DRUG_OFFENSE",
                "HARASSMENT","TRAFFIC_VIOLATION","OTHER"]
            if(!allowedCrimeTypes.includes(crimeType)){
                throw new apiError(400, "Invalid crime type");
            }
            
            //description
            const aiDescription = await geminiAIService.generateDescription(description);

            //parallel execution for severity and summary
            const [severity, aiSummary] = await Promise.all([
            geminiAIService.generateSeverity(aiDescription),
            geminiAIService.generateSummary(
                aiDescription,
                crimeType,
                location,
                evidenceFiles || []
            )
            ]);
     
    
            //location
            if(!location || !location.coordinates || location.coordinates.length !== 2){
                throw new apiError(400, "Valid location must be selected on map");
            }
            
    
            const newCase = await Case.create({
                tenantId: tenant._id,
                citizenId: undefined,
                reporterName,
                reporterEmail,
                reporterPhone,
                location: {
                    type: "Point",
                    coordinates: location.coordinates
                },
                crimeType,
                evidenceFiles: evidenceFiles || [],
                severity,
                description : aiDescription,
                aiSummary,
                status: "PENDING",
                isAnonymous: true
            })
            if(!newCase) throw new apiError(400, "Case not created")
    
    
            //Notification Service
            const admins = await User.find({
                tenantId: tenant._id, 
                role: 'ADMIN', 
                status: 'APPROVED', 
                isApproved: true,
                isSuperAdmin: false
            })
            await Promise.all(
                admins.map(admin =>
                    NotificationService.send({
                    tenantId: tenant._id,
                    userId: admin._id,
                    type: 'anonymous_case_submission',
                    title: 'New Anonymous Case Submitted',
                    message: `An anonymous case has been submitted by ${reporterName}`,
                    channels: ['inapp']
                    })
                )
                );
                // Registered → in-app notification
                await NotificationService.send({
                    tenantId: tenant._id,
                    email: reporterEmail,
                    type: "anonymous_case_submission",
                    title: "Anonymous Case Submitted",
                    message: `An anonymous case has been submitted successfully`,
                    channels: ["email"]
                })
    
            //Pdf
            try {
                const filePath = await PDFService.generateReceipt(newCase);
                newCase.receiptPdf = filePath;
                await newCase.save();
            } catch (err) {
                console.error("Receipt PDF generation failed:", err);
            }
    
            return res.status(200).json(new apiResponse(200, newCase, "Anonymous case created successfully"))
    })

    /**
     * Tenant/station scoped case search reusable by every panel.
     *
     * Scope (caller -> visible cases):
     *   - Super admin   : any tenant (optionally narrowed by tenantId)
     *   - Admin         : own tenant
     *   - Station head  : cases of own police station
     *   - Regular police: cases assigned to them only
     *   - Citizen       : own cases only
     *
     * Text (q) matches: caseId, reporter name (guest), reporting citizen's name,
     * and crimeType / severity when q equals one of those enum values.
     */
    static searchCaseController = wrapAsync(async (req, res) => {

        const currentUser = req.user;

        let {
            q = "",
            severity: requestedSeverity,
            crimeType: requestedCrimeType,
            status: requestedStatus,
            tenantId: requestedTenantId,
            page = 1,
            limit = 10
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const skip = (pageNum - 1) * limitNum;

        const SEVERITIES = ["LOW","MEDIUM","HIGH","CRITICAL"];
        const CRIME_TYPES = [
            "THEFT","ROBBERY","ASSAULT","MURDER","DOMESTIC_VIOLENCE",
            "CYBER_CRIME","KIDNAPPING","FRAUD","DRUG_OFFENSE",
            "HARASSMENT","TRAFFIC_VIOLATION","OTHER"
        ];
        const STATUSES = ["PENDING","ASSIGNED","UNDER_INVESTIGATION","RESOLVED","CLOSED"];

        const filter = { isArchived: false };

        // Scope by caller
        if (currentUser.isSuperAdmin) {
            if (requestedTenantId) {
                filter.tenantId = new mongoose.Types.ObjectId(requestedTenantId);
            }
        } else if (currentUser.role === "ADMIN") {
            filter.tenantId = currentUser.tenantId;
        } else if (currentUser.role === "POLICE") {
            filter.tenantId = currentUser.tenantId;
            if (currentUser.isStationHead) {
                filter.policeStationId = currentUser.policeStationId;
            } else {
                filter.assignedTo = currentUser._id;
            }
        } else if (currentUser.role === "CITIZEN") {
            filter.tenantId = currentUser.tenantId;
            filter.citizenId = currentUser._id;
        } else {
            throw new apiError(403, "Not allowed to search cases");
        }

        // Explicit filters
        if (requestedSeverity) {
            if (!SEVERITIES.includes(requestedSeverity)) {
                throw new apiError(400, "Invalid severity");
            }
            filter.severity = requestedSeverity;
        }

        if (requestedCrimeType) {
            if (!CRIME_TYPES.includes(requestedCrimeType)) {
                throw new apiError(400, "Invalid crime type");
            }
            filter.crimeType = requestedCrimeType;
        }

        if (requestedStatus) {
            if (!STATUSES.includes(requestedStatus)) {
                throw new apiError(400, "Invalid status");
            }
            filter.status = requestedStatus;
        }

        // Free text search
        if (q && q.trim()) {
            const raw = q.trim();
            const safeQuery = escapeRegex(raw);
            const upper = raw.toUpperCase();

            const orConditions = [
                { caseId: { $regex: safeQuery, $options: "i" } },
                { reporterName: { $regex: safeQuery, $options: "i" } }
            ];

            if (SEVERITIES.includes(upper)) orConditions.push({ severity: upper });
            if (CRIME_TYPES.includes(upper)) orConditions.push({ crimeType: upper });

            // Match by reporting citizen's name (scoped to the same tenant when known)
            const citizenMatch = {
                role: "CITIZEN",
                fullName: { $regex: safeQuery, $options: "i" }
            };
            if (filter.tenantId) citizenMatch.tenantId = filter.tenantId;
            const citizenIds = await User.distinct("_id", citizenMatch);
            if (citizenIds.length) orConditions.push({ citizenId: { $in: citizenIds } });

            filter.$or = orConditions;
        }

        const [cases, total] = await Promise.all([
            Case.find(filter)
                .populate("citizenId", "fullName email")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 })
                .lean(),
            Case.countDocuments(filter)
        ]);

        return res.status(200).json(
            new apiResponse(200, {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                results: cases
            }, "Cases fetched successfully")
        );
    });

    static updateCaseStatus = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { newStatus, remarks } = req.body;
        const currentUser = req.user;

        // Correct statuses
        const validStatuses = ["ASSIGNED", "UNDER_INVESTIGATION", "RESOLVED", "CLOSED"];
        if (!validStatuses.includes(newStatus)) {
            throw new apiError(400, "Invalid status");
        }

        const caseDoc = await Case.findById(caseId);
        if (!caseDoc) {
            throw new apiError(404, "Case not found");
        }

        // 🔒 Tenant isolation
        if (!currentUser.isSuperAdmin &&
            caseDoc.tenantId.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(403, "Access denied");
        }

        const currentStatus = caseDoc.status;

        // Prevent same status
        if (currentStatus === newStatus) {
            throw new apiError(400, "Case already has this status");
        }

        // STATE MACHINE
        const validTransitions = {
            ASSIGNED: ["UNDER_INVESTIGATION"],
            UNDER_INVESTIGATION: ["RESOLVED"],
            RESOLVED: ["CLOSED"],
            CLOSED: []
        };

        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new apiError(400, `Invalid transition from ${currentStatus} to ${newStatus}`);
        }

        
        // ROLE CONTROL
        // Citizen blocked completely
        if (currentUser.role === "CITIZEN") {
            throw new apiError(403, "Citizens cannot update case status");
        }

        //  Police
        if (currentUser.role === "POLICE") {
            if (caseDoc.assignedPoliceId?.toString() !== currentUser._id.toString()) {
                throw new apiError(403, "Not assigned to this case");
            }

            const allowed = ["UNDER_INVESTIGATION", "RESOLVED"];
            if (!allowed.includes(newStatus)) {
                throw new apiError(403, "Wrong status update");
            }
        }

        // Admin
        if (currentUser.role === "ADMIN") {
            const allowed = ["CLOSED"];
            if (!allowed.includes(newStatus)) {
                throw new apiError(403, "Admin can only close cases");
            }
        }

        if (newStatus === "CLOSED") {
            // Generate full case PDF
            try {
                const filePath = await PDFService.generateFullCase(caseDoc);
                caseDoc.fullPdf = filePath;
                await caseDoc.save();
            } catch (err) {
                console.error("Full case PDF generation failed:", err);
            }
        }

        //Update
        const previousStatus = currentStatus;
        caseDoc.status = newStatus;
        await caseDoc.save();

        
        const caseUpdate = await CaseUpdate.create({
            tenantId: caseDoc.tenantId,
            caseId,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            previousStatus,
            newStatus,
            remarks: remarks || "",
            ipAddress: req.ip,
            userAgent: req.get("User-Agent")
        });

        // Notifications (your logic is good, keep it)
        await NotificationService.send({
            tenantId: caseDoc.tenantId,
            caseId,
            type: "case_status_updated",
            userId: caseDoc.citizenId,
            title: "Case Updated",
            message: `Your case is now ${newStatus}`,
            channels: ["inapp"]
        });

        res.status(200).json(
            new apiResponse(200, { caseDoc, caseUpdate }, "Case status updated")
        );
    });


    //Under police
    //New evidences can be added to the case by the police already handled in evidence and upload controller
    static getAssignedCases = wrapAsync(async (req, res) => {
            const currentUser = req.user;
            
            if (currentUser.role !== "POLICE") {
                throw new apiError(403, "Access denied");
            }
            
            const cases = await Case.find({
                assignedTo: currentUser._id
            });
            
            res.status(200).json(
                new apiResponse(200, cases, "Assigned cases fetched successfully")
            );
    });

    
}

export default CaseController;
