
// services/notificationService.js
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import { sendEmail } from './nodemailer.service.js'; // your existing service

class NotificationService {
        // On frontend, after login:

        // const socket = io('http://localhost:8000'); // match server URL
        // socket.emit('join', user._id); // join room with userId



  static async send({ tenantId, userId, email, type, title, message, html, channels = ["inapp","email"] }) {

    const notification = await Notification.create({
      tenantId,
      userId,
      type,
      title,
      message,
      channels,
      deliveryStatus: { inapp: channels.includes("inapp"), email: false }
    });

    // In-app real-time push via Socket.IO
    if(global.io && channels.includes("inapp")) {
      global.io.to(userId.toString()).emit('notification', notification);
    }

    // Send email using your existing service
    if(channels.includes("email")) {
      let recipientEmail = email;
      if (!recipientEmail && userId) {
        const user = await User.findById(userId);
        recipientEmail = user?.email;
      }
      if (channels.includes("email") && recipientEmail) {
        try {
          console.log("EMAIL TARGET:", recipientEmail);
          await sendEmail({
            to: recipientEmail,
            subject: title,
            text: message,
            html
          });

          notification.deliveryStatus.email = true;
          await notification.save();
        } catch(err) {
          console.error("Email notification failed:", err.message);
          console.error("Email notification failed:", err);
        }
      }
    }

    return notification;
  }

}

export default NotificationService;
