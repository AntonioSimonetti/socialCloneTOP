import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./styles/App.css";
import Homepage from "./components/home";
import LandingPage from "./components/landing";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return <div className="App">{user ? <Homepage /> : <LandingPage />}</div>;
}

export default App;
