import React, { useState } from "react";
import { signUpWithEmail } from "../firebase";
import countries from "countries-list";
import { validate } from "email-validator";
import "../styles/registrationform.css";

function RegistrationForm({ onBack }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState("Enter your information to register");

  const isEmailValid = (email) => {
    return validate(email);
  };

  //Client side validation. TO DO SERVER SIDE VALIDATION.
  const handleRegistration = async () => {
    if (
      !username ||
      !email ||
      !age ||
      !password ||
      !confirmPassword ||
      !position
    ) {
      setError("Please fill in all the fields.");
      return;
    }

    //verify email using email-validator
    if (!isEmailValid(email)) {
      setError("Invalid email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
      setError(
        "Password must contain at least one symbol, one number, and one capital letter."
      );
      return;
    }

    try {
      await signUpWithEmail(email, password);
      // Registration successful
    } catch (error) {
      console.log(error);
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else {
        setError("Error during registration.");
      }
    }
  };

  return (
    <div className="registrationForm">
      {error && <p>{error}</p>}
      <div className="labelInput">
        <label htmlFor="username">Name:</label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="age">Age:</label>
        <input
          type="number"
          id="age"
          name="age"
          max="99"
          placeholder="Enter your age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <label htmlFor="position">Position:</label>
        <select
          id="position"
          name="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          <option value="">Select a position</option>
          {Object.keys(countries.countries).map((code) => (
            <option key={code} value={countries.countries[code].name}>
              {countries.countries[code].name}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleRegistration}>Register</button>
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default RegistrationForm;
