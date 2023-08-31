import React, { useEffect, useState } from "react";
import { fetchNotifications } from "../firebaseUtils";
import "../styles/notifications.css";

function Notification() {
  const [notifications, setNotifications] = useState([]);

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

  useEffect(() => {
    console.log(notifications);
  }, [notifications]);

  return (
    <div className="notificationDiv">
      {notifications.map((notification) => (
        <div key={notification.id} className="notificationItem">
          {notification.type === "like" ? (
            <p className="likeNotification">
              {notification.sender} liked your post.
            </p>
          ) : notification.type === "comment" ? (
            <p className="commentNotification">
              {" "}
              {notification.sender} has commented your post.
            </p>
          ) : (
            <p className="otherNotification">
              {notification.sender} retweeted your post.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default Notification;
