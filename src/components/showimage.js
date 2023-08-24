import React, { useEffect, useState } from "react";
import "../styles/showimage.css";

function ShowImage({ onClose, tweet }) {
  return (
    <div className="imageDiv">
      <button onClick={onClose}>X</button>
      <img src={tweet.imageUrl} alt="tweet" />
    </div>
  );
}

export default ShowImage;
