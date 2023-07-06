import React from "react";
import { signOutUser } from "../firebase"; // Importa il metodo signOut dal tuo file di Firebase

function Homepage() {
  const handleLogout = async () => {
    try {
      await signOutUser(); // Esegui il logout utilizzando il metodo signOut
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="homepage">
      <p>Homepage Test</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Homepage;
