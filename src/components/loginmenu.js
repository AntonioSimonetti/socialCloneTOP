import React, { useState } from "react";
import { signInWithEmail, resetPasswordWithEmail } from "../firebase";
import "../styles/loginmenu.css";

function LoginMenu({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      setError("Inserisci un'email valida.");
      setSuccessMessage("");
      return;
    }

    try {
      await resetPasswordWithEmail(email);
      setSuccessMessage("Email sent!");
      setError("");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("L'email non è associata a un account.");
      } else {
        setError("Errore nell'invio dell'email di reset password.");
      }
      setSuccessMessage("");
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmail(email, password);
      // Accesso effettuato con successo
    } catch (error) {
      console.log(error);
      // Gestione degli errori di accesso
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Credenziali non valide.");
      } else {
        setError("Errore durante l'accesso.");
      }
    }
  };

  const toggleResetPassword = () => {
    setIsResetPassword((prevState) => !prevState);
    setEmail("");
    setPassword("");
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="loginMenu">
      {!isResetPassword ? (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={toggleResetPassword}>Forgot Password?</button>
          <button onClick={onBack}>Back</button>
        </>
      ) : (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleResetPassword}>Send Reset Email</button>
          <button onClick={toggleResetPassword}>Back</button>
        </>
      )}
      {error && <p className="error">{error}</p>}
      {successMessage && <p>{successMessage}</p>}
    </div>
  );
}

export default LoginMenu;
