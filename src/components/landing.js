import React, { useState } from "react";
import RegistrationForm from "./registrationform";
import LoginMenu from "./loginmenu"; // Importa il componente LoginMenu
import "../styles/landing.css";
import { signInWithGoogle } from "../firebase";

function LandingPage() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false); // Aggiungi la variabile di stato per il LoginMenu

  const handleCreateAccount = () => {
    setShowRegistrationForm((prevState) => !prevState);
  };

  const handleRegister = (userData) => {
    //logica per gestire il passaggio di dati dal form al db firebase
    console.log("Dati di registrazione:", userData);
  };

  const handleLogin = () => {
    setShowLoginMenu(true); // Mostra il componente LoginMenu
  };

  return (
    <div className="landingMainDiv">
      {!showLoginMenu && !showRegistrationForm && (
        <>
          <h1>Logo</h1>
          <h1>Join us!</h1>
        </>
      )}
      {!showRegistrationForm && !showLoginMenu && (
        <div className="landingAccessButtonsDiv">
          <button className="googleSignIn" onClick={signInWithGoogle}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google Logo"
              className="googleLogo"
            />
            <p className="textSingIn">Sign in with Google</p>
          </button>
          <button className="appleSignIn">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg"
              alt="Apple Logo"
              className="appleLogo"
            />
            <p className="textSingIn">Sign in with Apple</p>
          </button>
        </div>
      )}
      {!showRegistrationForm && !showLoginMenu ? (
        <>
          <h2>or</h2>
          <button className="createAccountButton" onClick={handleCreateAccount}>
            Create an Account
          </button>
          <button className="loginButton" onClick={handleLogin}>
            Log in
          </button>
        </>
      ) : showRegistrationForm ? (
        <RegistrationForm
          onRegister={handleRegister}
          onBack={handleCreateAccount}
        />
      ) : (
        <LoginMenu onBack={() => setShowLoginMenu(false)} />
      )}
    </div>
  );
}

export default LandingPage;
