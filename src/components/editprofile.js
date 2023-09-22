import React, { useState, useEffect } from "react";
import countries from "countries-list";
import {
  editProfile,
  setBackgroundColor,
  uploadProfileImage,
} from "../firebaseUtils";
import "../styles/editprofile.css";

function Editprofile({ onClose, onUser, onImageUpload, onImageChange }) {
  const [position, setPosition] = useState(onUser?.position || "");
  const [age, setAge] = useState(onUser?.age || "");
  const [gender, setGender] = useState(onUser?.gender || "");
  const [bio, setBio] = useState(onUser?.bio || "");
  const [bgc, setBgc] = useState("#ffffff");
  const [image, setImage] = useState(null);

  const handleConfirmClick = async () => {
    // Update the header background color in the parent component

    const updatedData = {
      position: position,
      bio: bio,
      age: age,
      gender: gender,
    };

    // Call the setBackgroundColor function to save the background color
    await setBackgroundColor(bgc)
      .then(() => {
        console.log("Background color saved successfully");
      })
      .catch((error) => {
        console.error("Error saving background color:", error);
      });

    // Upload the selected image if it exists
    if (image) {
      onImageUpload(image); // Call the callback function with the URL
      uploadProfileImage(onUser.id, image);
    }

    editProfile(onUser, updatedData)
      .then(() => {
        onClose();
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
      });
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
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
          maxLength={100}
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
        <label htmlFor="backgroundColor">Background Color:</label>
        <input
          type="color"
          id="backgroundColor"
          value={bgc}
          onChange={(e) => setBgc(e.target.value)}
        />

        <label htmlFor="profileImage">Profile Image:</label>
        <input
          type="file"
          id="profileImage"
          accept="image/*"
          onChange={handleImageChange}
        />

        <button onClick={handleConfirmClick}>Confirm</button>
      </div>
    </div>
  );
}

export default Editprofile;
