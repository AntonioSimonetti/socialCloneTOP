import React, { useEffect, useState } from "react";
import { storage } from "../firebaseUtils";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import "../styles/addmedia.css";

function AddMedia({ onClose, onImageUrlChange }) {
  const [imageUpload, setImageUpload] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadImage = () => {
    if (imageUpload === null) {
      setFileError("Please select a file.");
      return;
    }

    const allowedExtensions = [
      "jpeg",
      "jpg",
      "png",
      "mp4",
      "gif",
      "svg",
      "pdf",
      "jp2",
      "webp",
      "avi",
      "mov",
      "mp3",
      "wav",
    ];
    const fileExtension = imageUpload.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setFileError(
        "Invalid file format. Please select a JPEG, PNG, or MP4 file."
      );
      return;
    }

    setUploading(true); // Imposta lo stato di uploading a true

    let uniqueName = imageUpload.name + v4();

    const imageRef = ref(storage, `images/${uniqueName}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      alert("Image Uploaded");

      getDownloadURL(imageRef).then((url) => {
        onImageUrlChange(url);
      });

      setUploading(false); // Imposta lo stato di uploading a false
    });
  };

  return (
    <div className="add-media">
      <button className="close-button" onClick={onClose}>
        X
      </button>
      <input
        type="file"
        accept=".jpeg, .jpg, .png, .mp4, .gif, .svg, .pdf, .jp2, .webp, .avi, .mov, .mp3, .wav"
        onChange={(event) => {
          setImageUpload(event.target.files[0]);
          setFileError(null); // Reset error on file change
        }}
      />
      {fileError && <p className="error-message">{fileError}</p>}
      <button onClick={uploadImage}>Upload</button>
      {uploading && <p>Uploading...</p>}
    </div>
  );
}

export default AddMedia;
