import React, { useState } from "react";
import RegistrationForm from "./registrationform";

function LandingPage() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const handleCreateAccount = () => {
    setShowRegistrationForm((prevState) => !prevState);
  };

  const handleRegister = (userData) => {
    //logica per gestire il passaggio di dati dal form al db firebase

    console.log("Dati di registrazione:", userData);
  };

  return (
    <div className="landingMainDiv">
      <h1>Logo</h1>
      <h1>Join us!</h1>
      {!showRegistrationForm && (
        <div className="landingAccessButtonsDiv">
          <button className="googleSignIn">GOOGLE</button>
          <button className="appleSignIn">APPLE</button>
        </div>
      )}
      {!showRegistrationForm ? (
        <>
          <h2>or</h2>
          <button className="createAccountButton" onClick={handleCreateAccount}>
            CREATE ACCOUNT!
          </button>
          <h3>log in</h3>
        </>
      ) : (
        <RegistrationForm
          onRegister={handleRegister}
          onBack={handleCreateAccount}
        />
      )}
    </div>
  );
}

export default LandingPage;
