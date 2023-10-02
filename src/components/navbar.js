import React, { useState, useEffect, useRef } from "react";
import "../styles/navbar.css";
import homesvg from "../img/home-2-svgrepo-com.svg";
import searchsvg from "../img/magnifying-glass-for-search-svgrepo-com.svg";
import createChatsvg from "../img/chat-square-call-svgrepo-com.svg";
import profilesvg from "../img/user-svgrepo-com.svg";
import { fetchNotifications, navbarLogIn } from "../firebaseUtils";

function Navbar({
  onSearchClick,
  onHomeClick,
  onAddTweetClick,
  onProfileClick,
  onNotificationsClick,
  Nkey,
}) {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const navbarRef = useRef(null);
  const notificationLengthTwoRef = useRef(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    navbarLogIn();
  }, []);

  useEffect(() => {
    if (notificationCount > 0) {
      notificationLengthTwoRef.current.classList.add("active");
    } else {
      notificationLengthTwoRef.current.classList.remove("active");
    }
  }, [notificationCount]);

  useEffect(() => {
    const updateNotificationCount = async () => {
      try {
        const notifications = await fetchNotifications();

        if (
          notifications === null ||
          notifications === undefined ||
          notifications.length === 0
        ) {
          setNotificationCount(0);
          return;
        } else {
          setNotificationCount(notifications.length);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    updateNotificationCount();
  });

  const handleScroll = () => {
    const scrolledToBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight;
    setIsAtBottom(scrolledToBottom);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Aggiungi o rimuovi la classe "hidden" in base a isAtBottom
    if (navbarRef.current) {
      if (isAtBottom) {
        navbarRef.current.classList.add("hidden");
      } else {
        navbarRef.current.classList.remove("hidden");
      }
    }
  }, [isAtBottom]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAtBottom(false);
    }, 2); // You can adjust the delay if needed

    return () => clearTimeout(timer);
  }, [Nkey]);

  return (
    <div className={`navbar ${isAtBottom ? "hidden" : ""}`} ref={navbarRef}>
      <div className="icon-container" onClick={onHomeClick}>
        <img src={homesvg} alt="homeicon" />
      </div>
      <div className="icon-container">
        <img src={searchsvg} alt="searchicon" onClick={onSearchClick} />{" "}
      </div>
      <div className="icon-container-center">
        <img src={createChatsvg} alt="icon" onClick={onAddTweetClick} />
      </div>
      <div className="icon-container">
        <p
          className="notification-lengthTwo"
          onClick={onNotificationsClick}
          ref={notificationLengthTwoRef}
        >
          {notificationCount}
        </p>
      </div>
      <div className="icon-container">
        <img src={profilesvg} alt="createicon" onClick={onProfileClick} />{" "}
      </div>
    </div>
  );
}

export default Navbar;
