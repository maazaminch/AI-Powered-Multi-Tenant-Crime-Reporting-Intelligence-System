import wrapAsync from "../utils/wrapAsync.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import Case from "../models/case.model.js";
import User from "../models/user.model.js";
import PoliceStation from "../models/policeStation.model.js";
import CaseUpdate from "../models/caseUpdate.model.js";
import NotificationService from "./notification.service.js";

class CaseAssignmentService {

    static assignCaseToStation = wrapAsync(async (caseId, stationId, currentUser) => {
        // Validate case exists
        const caseData = await Case.findById(caseId);
        if (!caseData) {
            throw new apiError(404, "Case not found");
        }

        // Validate station exists
        const station = await PoliceStation.findById(stationId);
        if (!station) {
            throw new apiError(404, "Police station not found");
        }

        // Tenant isolation
        if (!currentUser.isSuperAdmin) {
            if (caseData.tenantId.toString() !== currentUser.tenantId.toString() ||
                station.tenantId.toString() !== currentUser.tenantId.toString()) {
                throw new apiError(403, "Access denied");
            }
        }

        // Only allow assignment if case is PENDING
        if (caseData.status !== "PENDING") {
            throw new apiError(400, "Case can only be assigned to station when status is PENDING");
        }

        // Update case with station assignment
        const updatedCase = await Case.findByIdAndUpdate(
            caseId,
            {
                policeStationId: stationId,
                status: "ASSIGNED_TO_POLICE_STATION",
                assignedBy: currentUser._id
            },
            { new: true }
        ).populate('policeStationId', 'stationName code address');

        // Create case update
        await CaseUpdate.create({
            tenantId: caseData.tenantId,
            caseId: caseId,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType: "STATUS_UPDATE",
            previousStatus: "PENDING",
            newStatus: "ASSIGNED_TO_POLICE_STATION",
            remarks: `Case assigned to ${station.stationName}`,
            ipAddress: currentUser.ip,
            userAgent: currentUser.userAgent
        });

        // Notify station head (if exists)
        if (station.stationHead) {
            await NotificationService.send({
                tenantId: station.tenantId,
                userId: station.stationHead,
                type: "case_assigned_to_station",
                title: "Case Assigned to Station",
                message: `New case ${updatedCase.caseId} has been assigned to your station`,
                channels: ["inapp", "email"]
            });
        }

        return updatedCase;
    });

    static assignCaseToPolice = wrapAsync(async (caseId, policeId, stationHeadUser) => {
        // Validate case exists
        const caseData = await Case.findById(caseId);
        if (!caseData) {
            throw new apiError(404, "Case not found");
        }

        // Validate police exists
        const police = await User.findById(policeId);
        if (!police) {
            throw new apiError(404, "Police officer not found");
        }

        if (police.role !== "POLICE") {
            throw new apiError(400, "Case can only be assigned to police officers");
        }

        // Validate station head permissions
        if (!stationHeadUser.isStationHead) {
            throw new apiError(403, "Only station heads can assign cases to police");
        }

        // Police must belong to the same station as the case
        if (caseData.policeStationId?.toString() !== police.policeStationId?.toString()) {
            throw new apiError(400, "Police officer must belong to the same station as the case");
        }

        // Station head must belong to the same station
        if (stationHeadUser.policeStationId?.toString() !== caseData.policeStationId?.toString()) {
            throw new apiError(403, "You can only assign cases from your own station");
        }

        // Only allow assignment if case is ASSIGNED_TO_POLICE_STATION
        if (caseData.status !== "ASSIGNED_TO_POLICE_STATION") {
            throw new apiError(400, "Case must be assigned to station before assigning to police");
        }

        // Don't assign if already assigned to this police
        if (caseData.assignedTo?.toString() === policeId) {
            throw new apiError(400, "Case is already assigned to this police officer");
        }

        // Update case assignment
        const updatedCase = await Case.findByIdAndUpdate(
            caseId,
            {
                assignedTo: policeId,
                assignedBy: stationHeadUser._id,
                status: "UNDER_INVESTIGATION"
            },
            { new: true }
        ).populate([
            { path: 'assignedTo', select: 'fullName email badgeNumber' },
            { path: 'policeStationId', select: 'stationName' }
        ]);

        // Create case update
        await CaseUpdate.create({
            tenantId: caseData.tenantId,
            caseId: caseId,
            updaterRole: stationHeadUser.role,
            updatedBy: stationHeadUser._id,
            updateType: "STATUS_UPDATE",
            previousStatus: "ASSIGNED_TO_POLICE_STATION",
            newStatus: "UNDER_INVESTIGATION",
            remarks: `Case assigned to Police Officer ${police.fullName}`,
            ipAddress: stationHeadUser.ip,
            userAgent: stationHeadUser.userAgent
        });

        // Notify assigned police
        await NotificationService.send({
            tenantId: caseData.tenantId,
            userId: policeId,
            type: "case_assigned_to_police",
            title: "Case Assigned for Investigation",
            message: `You have been assigned to investigate case ${updatedCase.caseId}`,
            channels: ["inapp", "email"]
        });

        // Notify citizen (if not anonymous)
        if (!caseData.isAnonymous && caseData.citizenId) {
            await NotificationService.send({
                tenantId: caseData.tenantId,
                userId: caseData.citizenId,
                type: "case_investigation_started",
                title: "Investigation Started",
                message: `Your case ${updatedCase.caseId} is now under investigation`,
                channels: ["inapp", "email"]
            });
        }

        return updatedCase;
    });


    static reassignCase = wrapAsync(async (caseId, newPoliceId, stationHeadUser) => {
        // Validate case exists
        const caseData = await Case.findById(caseId);
        if (!caseData) {
            throw new apiError(404, "Case not found");
        }

        // Validate new police
        const newPolice = await User.findById(newPoliceId);
        if (!newPolice) {
            throw new apiError(404, "Police officer not found");
        }

        if (newPolice.role !== "POLICE") {
            throw new apiError(400, "Case can only be assigned to police officers");
        }

        // Station head validation
        if (!stationHeadUser.isStationHead) {
            throw new apiError(403, "Only station heads can reassign cases");
        }

        // Must be from same station
        if (stationHeadUser.policeStationId?.toString() !== caseData.policeStationId?.toString()) {
            throw new apiError(403, "You can only reassign cases from your own station");
        }

        if (newPolice.policeStationId?.toString() !== caseData.policeStationId?.toString()) {
            throw new apiError(400, "New police officer must belong to the same station");
        }

        // Only allow reassignment if case is UNDER_INVESTIGATION
        if (caseData.status !== "UNDER_INVESTIGATION") {
            throw new apiError(400, "Only cases under investigation can be reassigned");
        }

        const previousPoliceId = caseData.assignedTo;

        // Update case assignment
        const updatedCase = await Case.findByIdAndUpdate(
            caseId,
            {
                assignedTo: newPoliceId,
                assignedBy: stationHeadUser._id
            },
            { new: true }
        ).populate([
            { path: 'assignedTo', select: 'fullName email badgeNumber' },
            { path: 'policeStationId', select: 'stationName' }
        ]);

        // Create case update
        await CaseUpdate.create({
            tenantId: caseData.tenantId,
            caseId: caseId,
            updaterRole: stationHeadUser.role,
            updatedBy: stationHeadUser._id,
            updateType: "STATUS_UPDATE",
            previousStatus: "UNDER_INVESTIGATION",
            newStatus: "UNDER_INVESTIGATION",
            remarks: `Case reassigned from previous officer to ${newPolice.fullName}`,
            ipAddress: stationHeadUser.ip,
            userAgent: stationHeadUser.userAgent
        });

        // Notify new police
        await NotificationService.send({
            tenantId: caseData.tenantId,
            userId: newPoliceId,
            type: "case_reassigned",
            title: "Case Reassigned",
            message: `Case ${updatedCase.caseId} has been reassigned to you`,
            channels: ["inapp", "email"]
        });

        // Notify previous police (if exists and different)
        if (previousPoliceId && previousPoliceId.toString() !== newPoliceId) {
            await NotificationService.send({
                tenantId: caseData.tenantId,
                userId: previousPoliceId,
                type: "case_reassignment_removed",
                title: "Case Reassignment",
                message: `Case ${updatedCase.caseId} has been reassigned to another officer`,
                channels: ["inapp"]
            });
        }

        return updatedCase;
    });

}

export default CaseAssignmentService;
