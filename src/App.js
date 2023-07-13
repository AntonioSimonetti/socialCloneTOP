import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./styles/App.css";
import Homepage from "./components/home";
import LandingPage from "./components/landing";
import Navbar from "./components/navbar";
import Profile from "./components/profile";
import Addtweet from "./components/addtweet";

function App() {
  const [user, setUser] = useState(null);
  const [currentComponent, setCurrentComponent] = useState("homepage");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSearchClick = () => {
    setCurrentComponent("profile");
  };

  const handleHomeClick = () => {
    setCurrentComponent("homepage");
  };

  const handleAddTweetClick = () => {
    setCurrentComponent("addtweet");
  };

  return (
    <div className="App">
      {user ? (
        <>
          {currentComponent === "homepage" && <Homepage />}
          {currentComponent === "profile" && <Profile />}
          {currentComponent === "addtweet" && <Addtweet />}
          <Navbar
            onSearchClick={handleSearchClick}
            onHomeClick={handleHomeClick}
            onAddTweetClick={handleAddTweetClick}
          />
        </>
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

export default App;
