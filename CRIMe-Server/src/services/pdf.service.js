
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import apiError from "../utils/apiError.js";

class PDFService {

  static generateFilePath(caseId, type) {
    const dir = path.join("uploads", "pdfs");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return path.join(dir, `${caseId}-${type}.pdf`);
  }

  static generateContentHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  //we have to change it it can create the same id twice
  static generateDocumentId(caseId, type) {
    return `${type.toUpperCase()}-${new Date().getFullYear()}-${caseId}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  static maskEmail(email) {
    if (!email) return 'N/A';
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local[0]}***@${domain}`;
  }

  static maskPhone(phone) {
    if (!phone) return 'N/A';
    if (phone.length <= 6) return phone;
    return phone.slice(0, phone.length - 4).replace(/./g, '*') + phone.slice(-4);
  }

  /**
   * Generate PDF receipt at case submission
   */
  static async generateReceipt(caseData, stationName, tenantName) {
    try {
      const filePath = this.generateFilePath(caseData.caseId, "receipt");
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#1e3a8a')
         .text('CRIME REPORTING SYSTEM', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#64748b')
         .text('Multi-Tenant Crime Management Platform', { align: 'center' });
      doc.moveDown(1);

      // Separator
      doc.moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .strokeColor('#e2e8f0')
         .lineWidth(1)
         .stroke();
      doc.moveDown(1);

      // Title
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#0f172a')
         .text('CASE ACKNOWLEDGMENT RECEIPT', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica-Oblique')
         .fillColor('#dc2626')
         .text('⚠ This is an acknowledgment of filing, not a legal certified copy.', { align: 'center' });
      doc.moveDown(1.5);

      // Case Details Box
      doc.roundedRect(50, doc.y, 495, 140, 5)
         .fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#1e293b')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('CASE DETAILS', 65, doc.y + 15);
      
      const startY = doc.y + 35;
      const leftCol = 65;
      const rightCol = 300;
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#475569');
      doc.text('Case Reference Number:', leftCol, startY);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(caseData.caseId, rightCol, startY);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Filing Date & Time:', leftCol, startY + 20);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(new Date(caseData.createdAt).toLocaleString(), rightCol, startY + 20);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Station/Tenant:', leftCol, startY + 40);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(`${stationName} - ${tenantName}`, rightCol, startY + 40);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Case Type:', leftCol, startY + 60);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(caseData.crimeType, rightCol, startY + 60);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Severity:', leftCol, startY + 80);
      const severityColor = caseData.severity === 'HIGH' ? '#ef4444' : caseData.severity === 'MEDIUM' ? '#f59e0b' : caseData.severity === 'LOW' ? '#22c55e' : '#64748b';
      doc.fillColor(severityColor)
         .font('Helvetica-Bold')
         .text(caseData.severity, rightCol, startY + 80);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Current Status:', leftCol, startY + 100);
      doc.fillColor('#f59e0b')
         .font('Helvetica-Bold')
         .text('PENDING REVIEW', rightCol, startY + 100);

      doc.y = startY + 145;
      doc.moveDown(1);

      // Reporter Information Box
      doc.roundedRect(50, doc.y, 495, 100, 5)
         .fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#1e293b')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('REPORTER INFORMATION', 65, doc.y + 15);
      
      const reporterStartY = doc.y + 35;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#475569');
      doc.text('Reporter Type:', leftCol, reporterStartY);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(caseData.reporter.type, rightCol, reporterStartY);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Full Name:', leftCol, reporterStartY + 20);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(caseData.reporter.fullName, rightCol, reporterStartY + 20);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Email:', leftCol, reporterStartY + 40);
      const maskedEmail = caseData.reporter.type === 'CITIZEN' ? this.maskEmail(caseData.reporter.email) : caseData.reporter.email;
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(maskedEmail, rightCol, reporterStartY + 40);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Phone:', leftCol, reporterStartY + 60);
      const maskedPhone = caseData.reporter.type === 'CITIZEN' ? this.maskPhone(caseData.reporter.phone) : caseData.reporter.phone;
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(maskedPhone, rightCol, reporterStartY + 60);

      doc.y = reporterStartY + 105;
      doc.moveDown(1.5);

      // Tracking Information
      doc.roundedRect(50, doc.y, 495, 60, 5)
         .fillAndStroke('#eff6ff', '#3b82f6');
      doc.fillColor('#1e40af')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('TRACKING INFORMATION', 65, doc.y + 15);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#1e3a8a');
      doc.text('Use this tracking code to check your case status:', 65, doc.y + 35);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .fontSize(14)
         .text(caseData.trackingToken || 'N/A', 65, doc.y + 50);

      doc.y += 75;
      doc.moveDown(1);

      // Footer
      doc.moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .strokeColor('#e2e8f0')
         .lineWidth(1)
         .stroke();
      doc.moveDown(1);
      
      const docId = this.generateDocumentId(caseData.caseId, 'ACK');
      const contentHash = this.generateContentHash(caseData);
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#64748b');
      doc.text('Generated by Crime Reporting System', { align: 'center' });
      doc.text(`Document ID: ${docId}`, { align: 'center' });
      doc.text(`Content Hash: ${contentHash}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.text('This document is auto-generated. For any queries, contact the police station.', { align: 'center' });

      doc.end();

      return filePath;

    } catch (err) {
      console.error("Receipt PDF generation failed:", err);
      throw new apiError(500, "Receipt PDF generation failed");
    }
  }

  /**
   * Generate full PDF after case is resolved (Citizen/Redacted Version)
   */
  static async generateFullCase(caseData, updates, evidenceCount, isFullVersion = false) {
    try {
      // Check case status if provided
      if (caseData.status && caseData.status !== "CLOSED") {
        throw new apiError(400, "Full PDF can only be generated for closed cases");
      }

      const type = isFullVersion ? 'full' : 'citizen';
      const filePath = this.generateFilePath(caseData.caseId, type);
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#1e3a8a')
         .text('CRIME REPORTING SYSTEM', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#64748b')
         .text('Multi-Tenant Crime Management Platform', { align: 'center' });
      doc.moveDown(1);

      // Separator
      doc.moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .strokeColor('#e2e8f0')
         .lineWidth(1)
         .stroke();
      doc.moveDown(1);

      // Title
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#0f172a')
         .text('CASE FINAL REPORT', { align: 'center' });
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#22c55e')
         .text('✓ CASE CLOSED', { align: 'center' });
      if (isFullVersion) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#dc2626')
           .text('⚠ AUTHORIZED PERSONNEL ONLY', { align: 'center' });
      }
      doc.moveDown(1.5);

      // Case Details Box
      doc.roundedRect(50, doc.y, 495, 160, 5)
         .fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#1e293b')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('CASE DETAILS', 65, doc.y + 15);
      
      const startY = doc.y + 35;
      const leftCol = 65;
      const rightCol = 300;
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#475569');
      doc.text('Case Reference Number:', leftCol, startY);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(caseData.caseId, rightCol, startY);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Filing Date:', leftCol, startY + 20);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(new Date(caseData.createdAt).toLocaleDateString(), rightCol, startY + 20);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Closure Date:', leftCol, startY + 40);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(new Date(caseData.closedAt).toLocaleDateString(), rightCol, startY + 40);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Case Type:', leftCol, startY + 60);
      doc.fillColor('#0f172a')
         .font('Helvetica-Bold')
         .text(caseData.crimeType, rightCol, startY + 60);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Severity:', leftCol, startY + 80);
      const severityColor = caseData.severity === 'HIGH' ? '#ef4444' : caseData.severity === 'MEDIUM' ? '#f59e0b' : caseData.severity === 'LOW' ? '#22c55e' : '#64748b';
      doc.fillColor(severityColor)
         .font('Helvetica-Bold')
         .text(caseData.severity, rightCol, startY + 80);
      
      doc.fillColor('#475569')
         .font('Helvetica')
         .text('Final Status:', leftCol, startY + 100);
      doc.fillColor('#22c55e')
         .font('Helvetica-Bold')
         .text('CLOSED', rightCol, startY + 100);
      
      if (isFullVersion && caseData.assignedTo) {
        doc.fillColor('#475569')
           .font('Helvetica')
           .text('Assigned Officer:', leftCol, startY + 120);
        doc.fillColor('#0f172a')
           .font('Helvetica-Bold')
           .text(caseData.assignedTo.fullName || 'N/A', rightCol, startY + 120);
      }

      doc.y = startY + 165;
      doc.moveDown(1);

      // Case Summary
      doc.roundedRect(50, doc.y, 495, 80, 5)
         .fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#1e293b')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('CASE SUMMARY', 65, doc.y + 15);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#475569');
      doc.text(caseData.description || 'No description provided', 65, doc.y + 35);

      doc.y += 90;
      doc.moveDown(1);

      // Investigation Timeline
      doc.roundedRect(50, doc.y, 495, 100, 5)
         .fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#1e293b')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('INVESTIGATION TIMELINE', 65, doc.y + 15);
      
      const timelineY = doc.y + 35;
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#475569');
      
      if (updates && updates.length > 0) {
        updates.forEach((update, index) => {
          const yPos = timelineY + (index * 15);
          if (yPos > 700) {
            doc.addPage();
            doc.y = 50;
          }
          const dateStr = new Date(update.createdAt).toLocaleString();
          doc.text(`• ${dateStr} - ${update.updateType}: ${update.remarks || update.newStatus || 'No remarks'}`, 65, yPos);
        });
      } else {
        doc.text('No updates recorded', 65, timelineY);
      }

      doc.y = timelineY + (updates.length * 15) + 25;
      doc.moveDown(1);

      // Evidence Summary
      doc.roundedRect(50, doc.y, 495, 50, 5)
         .fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#1e293b')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('EVIDENCE SUMMARY', 65, doc.y + 15);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#475569');
      doc.text(`Total Evidence Files: ${evidenceCount || 0}`, 65, doc.y + 35);

      doc.y += 60;
      doc.moveDown(1);

      // Officer Notes (Full Version Only)
      if (isFullVersion) {
        doc.roundedRect(50, doc.y, 495, 70, 5)
           .fillAndStroke('#fef2f2', '#dc2626');
        doc.fillColor('#991b1b')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('OFFICER NOTES (INTERNAL)', 65, doc.y + 15);
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#7f1d1d');
        doc.text('Internal investigation notes are available in the system.', 65, doc.y + 35);
        doc.y += 80;
        doc.moveDown(1);
      }

      // Closure Information
      doc.roundedRect(50, doc.y, 495, 70, 5)
         .fillAndStroke('#f0fdf4', '#22c55e');
      doc.fillColor('#166534')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('CLOSURE INFORMATION', 65, doc.y + 15);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#166534');
      doc.text(`Closed By: ${caseData.closedBy?.fullName || 'N/A'}`, 65, doc.y + 35);
      doc.text(`Closure Reason: ${caseData.closureReason || 'Case closed'}`, 65, doc.y + 50);

      doc.y += 80;
      doc.moveDown(1);

      // Footer
      doc.moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .strokeColor('#e2e8f0')
         .lineWidth(1)
         .stroke();
      doc.moveDown(1);
      
      const docId = this.generateDocumentId(caseData.caseId, 'FINAL');
      const contentHash = this.generateContentHash(caseData);
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#64748b');
      doc.text('Generated by Crime Reporting System', { align: 'center' });
      doc.text(`Document ID: ${docId}`, { align: 'center' });
      doc.text(`Content Hash: ${contentHash}`, { align: 'center' });
      if (isFullVersion) {
        doc.text('Classification: INTERNAL - AUTHORIZED PERSONNEL ONLY', { align: 'center' });
      } else {
        doc.text('This is a redacted version for the reporter. Full version available to authorized personnel.', { align: 'center' });
      }

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
