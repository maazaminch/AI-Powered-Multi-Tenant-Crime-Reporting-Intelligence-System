
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import apiError from "../utils/apiError.js";

class PDFService {

  static generateFilePath(caseId, type) {
    const dir = path.join("uploads", "pdfs");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return path.join(dir, `${caseId}-${type}.pdf`);
  }

  /**
   * Generate PDF receipt at case submission
   */
  static async generateReceipt(caseData) {
    try {
      const filePath = this.generateFilePath(caseData.caseId, "receipt");

      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(filePath));

      doc.fontSize(18).text("Crime Report Receipt", { align: "center" });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Case ID: ${caseData.caseId}`);
      doc.text(`Crime Type: ${caseData.crimeType}`);
      doc.text(`Severity: ${caseData.severity}`);
      doc.text(`Submitted At: ${new Date(caseData.createdAt).toLocaleString()}`);
      doc.moveDown();

      doc.text("Description:");
      doc.text(caseData.description);

      doc.end();

      return filePath;

    } catch (err) {
      console.error("Receipt PDF generation failed:", err);
      throw new apiError(500, "Receipt PDF generation failed");
    }
  }

  /**
   * Generate full PDF after case is resolved
   */
  static async generateFullCase(caseData) {
    try {
      if (caseData.status !== "CLOSED") {
        throw new apiError(400, "Full PDF can only be generated for closed cases");
      }

      const filePath = this.generateFilePath(caseData.caseId, "full");

      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(filePath));

      doc.fontSize(18).text("Full Crime Case Report", { align: "center" });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Case ID: ${caseData.caseId}`);
      doc.text(`Crime Type: ${caseData.crimeType}`);
      doc.text(`Severity: ${caseData.severity}`);
      doc.text(`Status: ${caseData.status}`);
      doc.text(`Reported By: ${caseData.reporterName || "Anonymous"}`);
      doc.text(`Reported At: ${new Date(caseData.createdAt).toLocaleString()}`);
      doc.moveDown();

      doc.text("Incident Description:");
      doc.text(caseData.description);
      doc.moveDown();

      if (caseData.aiSummary) {
        doc.text("AI Summary:");
        doc.text(caseData.aiSummary);
        doc.moveDown();
      }

      if (caseData.resolutionDetails) {
        doc.text("Resolution Details:");
        doc.text(caseData.resolutionDetails);
        doc.moveDown();
      }

      doc.text("Location:");
      doc.text(
        `Latitude: ${caseData.location.coordinates[1]}, Longitude: ${caseData.location.coordinates[0]}`
      );

      doc.end();

      return filePath;

    } catch (err) {
      console.error("Full case PDF generation failed:", err);
      throw err instanceof apiError
        ? err
        : new apiError(500, "Full case PDF generation failed");
    }
  }
}

export default PDFService;
