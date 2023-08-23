import React, { useEffect, useState } from "react";
import { storage } from "../firebaseUtils";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import "../styles/addmedia.css";

function AddMedia({ onClose }) {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const uploadImage = () => {
    if (imageUpload == null) return;

    let uniqueName = imageUpload.name + v4();

    const imageRef = ref(storage, `images/${uniqueName}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      alert("Image Uploaded");

      getDownloadURL(imageRef).then((url) => {
        setImageUrl(url);
      });
    });
  };

  useEffect(() => {
    // Questo verrà eseguito ogni volta che imageUrl cambia
    if (imageUrl) {
      console.log("Nuovo URL dell'immagine:", imageUrl);
    }
  }, [imageUrl]);

  return (
    <div className="add-media">
      <button className="close-button" onClick={onClose}>
        X
      </button>
      <input
        type="file"
        onChange={(event) => {
          setImageUpload(event.target.files[0]);
        }}
      />
      <button onClick={uploadImage}>Upload</button>
    </div>
  );
}

export default AddMedia;
