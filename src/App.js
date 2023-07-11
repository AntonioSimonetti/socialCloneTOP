import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./styles/App.css";
import Homepage from "./components/home";
import LandingPage from "./components/landing";
import Navbar from "./components/navbar";
import Profile from "./components/profile";

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

  return (
    <div className="App">
      {user ? (
        <>
          {currentComponent === "homepage" && <Homepage />}
          {currentComponent === "profile" && <Profile />}
          <Navbar
            onSearchClick={handleSearchClick}
            onHomeClick={handleHomeClick}
          />
        </>
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

export default App;
