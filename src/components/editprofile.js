import React, { useState, useEffect } from "react";
import countries from "countries-list";
import { editProfile } from "../firebaseUtils";
import "../styles/editprofile.css";

function Editprofile({ onClose, onUser }) {
  const [position, setPosition] = useState(onUser?.position || "");
  const [age, setAge] = useState(onUser?.age || "");
  const [gender, setGender] = useState(onUser?.gender || "");
  const [bio, setBio] = useState(onUser?.bio || "");

  const handleConfirmClick = () => {
    // Qui chiamiamo la funzione editProfile con le modifiche apportate dall'utente

    const updatedData = {
      position: position,
      bio: bio,
      age: age,
      gender: gender,
    };

    editProfile(onUser, updatedData)
      .then(() => {
        onClose();
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
      });
  };

  return (
    <div className="editprofileDiv">
      <div className="editprofileContent">
        <button className="closeButton" onClick={onClose}>
          X
        </button>
        <h3>Personal info</h3>
        <label htmlFor="bio">Bio:</label>
        <input
          type="text"
          id="bio"
          placeholder="Enter your bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <label htmlFor="gender">Gender:</label>
        <input
          type="text"
          id="gender"
          placeholder="Define yourself"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
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

        <button onClick={handleConfirmClick}>Confirm</button>
      </div>
    </div>
  );
}

export default Editprofile;
