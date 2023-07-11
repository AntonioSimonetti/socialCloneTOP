import React, { useState } from "react";
import { signInWithEmail, resetPasswordWithEmail } from "../firebase";
import "../styles/loginmenu.css";

function LoginMenu({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [error, setError] = useState(
    "Insert your email and password to login."
  );
  const [successMessage, setSuccessMessage] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      setError("Invalid email.");
      setSuccessMessage("");
      return;
    }

    try {
      await resetPasswordWithEmail(email);
      setSuccessMessage("Email sent!");
      setError("");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("The email is not associated with any account");
      } else {
        setError("Error sending reset password email.");
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
        setError("Invalid credentials.");
      } else {
        setError("Error during login.");
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
      {error && <p className="error">{error}</p>}
      {successMessage && <p>{successMessage}</p>}
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
          <button onClick={onBack}>Back</button>
          <h3 onClick={toggleResetPassword}>Forgot Password?</h3>
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
    </div>
  );
}

export default LoginMenu;
