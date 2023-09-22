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
    const fileName = imageUpload.name;
    const fileExtension = imageUpload.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setFileError(
        "Invalid file format. Please select a JPEG, PNG, or MP4 file."
      );
      return;
    }

    if (fileName.includes("-")) {
      setFileError("File names cannot contain a hyphen (-).");
      return;
    }

    setUploading(true);

    let uniqueName = imageUpload.name + "-" + v4();
    let uploadPath = `images/${uniqueName}`;

    // Verifica se il file è un video e imposta il percorso di upload appropriato
    if (
      fileExtension === "mp4" ||
      fileExtension === "webm" ||
      fileExtension === "ogg"
    ) {
      uploadPath = `videos/${uniqueName}`;
    }

    const imageRef = ref(storage, uploadPath);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      alert("Image/Video Uploaded");

      getDownloadURL(imageRef).then((url) => {
        onImageUrlChange(url);
      });

      setUploading(false); // Imposta lo stato di uploading a false
    });
  };

  return (
    <div className="add-media">
      <div className="close-btn-div-addMedia">
        <button className="close-button" onClick={onClose}>
          X
        </button>
      </div>
      <div className="input-btn-div-addMedia">
        <input
          className="input-addMedia"
          type="file"
          accept=".jpeg, .jpg, .png, .mp4, .gif, .svg, .pdf, .jp2, .webp, .avi, .mov, .mp3, .wav"
          onChange={(event) => {
            setImageUpload(event.target.files[0]);
            setFileError(null); // Reset error on file change
          }}
        />
      </div>
      {fileError && <p className="error-message">{fileError}</p>}
      <div className="upload-div-addMedia">
        <button onClick={uploadImage} className="btn-upload-addMedia">
          Upload
        </button>
        {uploading && <p>Uploading...</p>}
      </div>
    </div>
  );
}

export default AddMedia;
