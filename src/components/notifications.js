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

  return (
    <div className="notificationDiv">
      {notifications.map((notification) => (
        <p key={notification.id}>ci sono</p>
      ))}
    </div>
  );
}

export default Notification;
