import React, { useState, useEffect, useRef } from "react";
import "../styles/navbar.css";
import homesvg from "../img/home-2-svgrepo-com.svg";
import searchsvg from "../img/magnifying-glass-for-search-svgrepo-com.svg";
import notifyoffsvg from "../img/bell-svgrepo-com.svg";
//import notifyonsvg from "../img/bell-bing-svgrepo-com.svg";
import createChatsvg from "../img/chat-square-call-svgrepo-com.svg";
import profilesvg from "../img/user-svgrepo-com.svg";

/* 
https://www.svgrepo.com/collection/solar-bold-icons/1
--
https://www.svgrepo.com/svg/525248/bell
https://www.svgrepo.com/svg/525249/bell-bing
https://www.svgrepo.com/svg/525374/home-2
https://www.svgrepo.com/svg/525415/logout-2
https://www.svgrepo.com/svg/525577/user-circle
https://www.svgrepo.com/svg/525770/chat-square-call
https://www.svgrepo.com/svg/479452/magnifying-glass-for-search

*/

function Navbar({
  onSearchClick,
  onHomeClick,
  onAddTweetClick,
  onProfileClick,
  onNotificationsClick,
}) {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const navbarRef = useRef(null);

  const handleScroll = () => {
    const scrolledToBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight;
    setIsAtBottom(scrolledToBottom);
    console.log("isAtBottom:", scrolledToBottom);
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
        <img
          src={notifyoffsvg}
          alt="notifyicon"
          onClick={onNotificationsClick}
        />{" "}
      </div>
      <div className="icon-container">
        <img src={profilesvg} alt="createicon" onClick={onProfileClick} />{" "}
      </div>
    </div>
  );
}

export default Navbar;
