import React, { useEffect, useState } from "react";
import { fetchNotifications } from "../firebaseUtils";
import NotificationDetails from "./notificationdetails";
import "../styles/notifications.css";

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const updateNotificationCount = async () => {
      try {
        const notifications = await fetchNotifications();
        if (notifications === undefined || notifications === null) {
          setNotificationCount(0); // Nessuna notifica disponibile
        } else {
          setNotificationCount(notifications.length);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    updateNotificationCount();
  }, []);

  useEffect(() => {
    // Crea una funzione asincrona per chiamare fetchNotifications
    const fetchData = async () => {
      try {
        const notify = await fetchNotifications();
        setNotifications(notify);
      } catch (error) {
        console.error("Errore durante il recupero delle notifiche:", error);
      }
    };

    // Chiama la funzione asincrona
    fetchData();
  }, []);

  return (
    <div className="notificationDiv">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className="notificationItem"
            onClick={() => setSelectedNotification(notification)}
          >
            {notification.type === "like" ? (
              <p className="likeNotification">
                {notification.senderName} liked your post.
              </p>
            ) : notification.type === "comment" ? (
              <p className="commentNotification">
                {notification.senderName} has commented on your post.
              </p>
            ) : notification.type === "follower" ? (
              <p className="followerNotification">
                {notification.senderName} started following you.
              </p>
            ) : (
              <p className="otherNotification">
                {notification.senderName} retweeted your post.
              </p>
            )}
          </div>
        ))
      ) : (
        <p className="noNotifyYet">No notifications yet</p>
      )}

      {selectedNotification && (
        <div className="notificationOverlay">
          <NotificationDetails
            notification={selectedNotification}
            onClose={() => {
              setSelectedNotification(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Notification;
