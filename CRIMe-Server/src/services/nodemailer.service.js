
import nodemailer from "nodemailer";

let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    console.log("ENV CHECK:", {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? "EXISTS" : "MISSING",
    });
    
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,     // your Gmail address
        pass: process.env.EMAIL_PASS,     // your 16-char App Password
      },
    });
  }
  return transporter;
};


export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporterInstance = createTransporter();
    const info = await transporterInstance.sendMail({
      from: `"CRS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error);
    throw error;
  }
};
