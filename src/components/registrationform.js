import React, { useState } from "react";

function RegistrationForm({ onRegister, onBack }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("");

  //TODO: Form validation / Password confirmation

  return (
    <div className="registrationForm">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
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
      <input
        type="text"
        placeholder="Position"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
      />
      <button
        onClick={() => onRegister({ username, email, password, position })}
      >
        Register
      </button>
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default RegistrationForm;
