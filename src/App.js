import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./styles/App.css";
import Homepage from "./components/home";
import LandingPage from "./components/landing";
import Navbar from "./components/navbar";
import Profile from "./components/profile";
import Addtweet from "./components/addtweet";
import UserSearch from "./components/usersearch";
import Notification from "./components/notifications";
import Infodiv from "./components/infodiv";

function App() {
  const [user, setUser] = useState(null);
  const [currentComponent, setCurrentComponent] = useState("homepage");
  const [navbarKey, setNavbarKey] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleProfileClick = () => {
    setCurrentComponent("profile");
  };

  const handleHomeClick = () => {
    setCurrentComponent("homepage");
  };

  const handleAddTweetClick = () => {
    setCurrentComponent("addtweet");
  };

  const handleSearchClick = () => {
    setCurrentComponent("search");
  };

  const handleNotificationsClick = () => {
    setCurrentComponent("notifications");
  };

  // Update the key to force re-render of Navbar
  useEffect(() => {
    setNavbarKey((prevKey) => prevKey + 1);
  }, [currentComponent]);

  return (
    <div className="App">
      {user ? (
        <>
          {currentComponent === "homepage" && <Homepage />}
          {currentComponent === "profile" && <Profile />}
          {currentComponent === "addtweet" && <Addtweet />}
          {currentComponent === "search" && <UserSearch />}
          {currentComponent === "notifications" && <Notification />}

          <Navbar
            Nkey={navbarKey}
            onProfileClick={handleProfileClick}
            onHomeClick={handleHomeClick}
            onAddTweetClick={handleAddTweetClick}
            onSearchClick={handleSearchClick}
            onNotificationsClick={handleNotificationsClick}
          />
        </>
      ) : (
        <>
          <div className="landingDiv">
            <Infodiv />
            <LandingPage />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
