import wrapAsync from "../../utils/wrapAsync.js";
import Notification from "../../models/notification.model.js";
import NotificationService from "../../services/notification.service.js";
import apiResponse from "../../utils/apiResponse.js";
import apiError from "../../utils/apiError.js";



class NotificationController {

  static fetchUserNotifications = wrapAsync(async (req, res) => {

  const currentUser = req.user;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const filter = {
    userId: currentUser._id,
    channels: "inapp"
  };
  // if(!currentUser.isSuperAdmin) {
  //   filter.userId = currentUser._id;
  // }

  const [notifications, totalNotifications] = await Promise.all([

    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Notification.countDocuments(filter)

  ]);
  if(!notifications) {
    throw new apiError(404, "No notifications found");
  }

  const totalPages = Math.ceil(totalNotifications / limit);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        notifications,
        pagination: {
          totalNotifications,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      "Notifications fetched successfully"
    )
  );
  });

  static fetchUserNotificationsForHeader = wrapAsync(async (req, res) => {
    const currentUser = req.user;

    const filter = {
      userId: currentUser._id,
      channels: "inapp"
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(5);
    
    return res.status(200).json(
        new apiResponse(
            200, 
            {notifications}, 
            "Header notifications fetched successfully"
        ));
  })

  static markAsRead = wrapAsync(async (req, res) => {
    const notificationId = req.params.notificationId;
    
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!updatedNotification) {
      throw new apiError(404, "Notification not updated");
    }

    return res.status(200).json(
      new apiResponse(
        200, 
        { notification: updatedNotification }, 
        "Notification marked as read"));
   }) 

   static unreadCount = wrapAsync(async (req, res) => {
    const currentUser = req.user;

    const unreadCount = await Notification.countDocuments({ 
      userId: currentUser._id, isRead: false });

    return res.status(200).json(
        new apiResponse(
            200, 
            { unreadCount }, 
            "Unread notifications count fetched successfully"));
   })
}

export default NotificationController;
