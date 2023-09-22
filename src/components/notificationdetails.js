import React, { useEffect, useState } from "react";
import {} from "../firebaseUtils";
import "../styles/notificationdetails.css";
import heartsvg from "../img/heart-svgrepo-com.svg";
import commentsvg from "../img/chat-round-svgrepo-com.svg";
import rtsvg from "../img/refresh-svgrepo-com.svg";
import { removeNotification } from "../firebaseUtils";

function NotificationDetails({ notification, onClose }) {
  const handleRemoveNotification = () => {
    // Call the removeNotification function and pass the notification key
    removeNotification(notification.uniqueKey);

    // Close the notification details
    onClose();
  };

  return (
    <div className="notificationDetailsNotify">
      <div className="buttonDivClose">
        <button
          onClick={handleRemoveNotification}
          className="button-closed-NotificationDetails"
        >
          X
        </button>
      </div>
      {notification.type === "follower" ? (
        <p>Ciao</p>
      ) : (
        <div key={notification.post.key} className="tweetNotifyDetails">
          <div className="topTweetDivNotifyDetails">
            <h3>{notification.name}</h3>
            <h3>{notification.post.name}</h3>
            <p>idplaceholder</p>
            <p>-</p>
            <p>{notification.post.date}</p>
            <p>{notification.post.timestamp}</p>
          </div>

          <div className="contentDivNotifyDetails">
            <p>{notification.post.content}</p>
          </div>

          <div className="reactionsDivNotifyDetails">
            <div className="likesDivNotifyDetails">
              <img src={heartsvg} alt="likeicon" />
              <p>{String(notification.post.likes)}</p>
            </div>
            <div className="rtDivNotifyDetails">
              <img src={rtsvg} alt="rticon" />
              <p>{String(notification.post.rt)}</p>
            </div>
            <div className="commentsDivNotifyDetails">
              <img src={commentsvg} alt="commenticon" />
              <p>{String(notification.post.comments.length)}</p>
            </div>
          </div>
          <div className="extra">
            {notification.post.imageUrl && (
              <div className="imageButton">
                <p className="fakeButton">View Image</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDetails;
