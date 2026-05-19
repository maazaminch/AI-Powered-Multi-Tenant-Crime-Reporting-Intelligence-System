import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  
    type: String,
    title: String,
    message: String,
  
    channels: [String], // inapp, email
  
    isRead: { type: Boolean, default: false },
    readAt: Date,
  
    deliveryStatus: {
      inapp: { type: Boolean, default: true },
      email: Boolean,
    //   push: Boolean,
    //   sms: Boolean
    }
  
  }, { timestamps: true });
  
  
  export default mongoose.model("Notification", NotificationSchema);
  

