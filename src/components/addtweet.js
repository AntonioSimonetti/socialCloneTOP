import React, { useEffect, useState } from "react";
import defaultusersvg from "../img/user-circle-svgrepo-com (1).svg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserProfileData, addTweet } from "../firebaseUtils";
import "../styles/addtweet.css";
import AddMedia from "./addMedia";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";

function Addtweet() {
  const [user, setUser] = useState(null);
  const [tweetContent, setTweetContent] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const MAX_CHARACTER_LIMIT = 155;
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getFirestore();

        // Crea un riferimento al documento dell'utente nella collezione "profileImage"
        const profileImageRef = doc(db, "profileImage", user.uid);

        try {
          const profileImageDoc = await getDoc(profileImageRef);

          if (profileImageDoc.exists()) {
            // Il documento esiste, quindi ottieni il link dell'immagine
            const profileImageData = profileImageDoc.data();
            const imageUrl = profileImageData.imageUrl;

            // Imposta lo stato con il link dell'immagine
            setProfileImageUrl(imageUrl);
          } else {
            //Il documento dell'immagine del profilo non esiste.
          }
        } catch (error) {
          console.error(
            "Errore nel recupero dell'immagine del profilo:",
            error
          );
        }
      }
    };

    // Chiama la funzione per ottenere il link dell'immagine del profilo
    fetchProfileImage();
  }, []);

  const handleImageUrlChange = (newImageUrl) => {
    setImageUrl(newImageUrl);
  };

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfileData = await fetchUserProfileData(user.uid);
        setUser(userProfileData);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update character count asynchronously to ensure accurate state update
  const handleTweetContentChange = (e) => {
    const content = e.target.value;
    setTweetContent(content);

    // Use setTimeout to update character count asynchronously
    setTimeout(() => {
      setCharacterCount(content.length);
    }, 0);
  };

  const handlePublishClick = () => {
    if (tweetContent.trim() !== "" && characterCount <= MAX_CHARACTER_LIMIT) {
      addTweet(tweetContent, imageUrl);
      setTweetContent("");
    } else {
      return;
    }
  };

  return (
    <div className="add-tweet">
      <div className="input-field">
        <div className="avatar">
          <img
            src={profileImageUrl || user?.photoURL || defaultusersvg}
            alt="user avatar"
          />
        </div>
        <textarea
          type="text"
          placeholder="Write a tweet"
          value={tweetContent}
          onChange={handleTweetContentChange}
          className={characterCount > MAX_CHARACTER_LIMIT ? "error" : ""}
        />
        <span
          className={`character-count ${
            characterCount > MAX_CHARACTER_LIMIT ? "exceeded" : ""
          }`}
        >
          {characterCount}/{MAX_CHARACTER_LIMIT}
        </span>
      </div>
      <div className="buttons">
        <button
          className="add-media-button"
          onClick={() => setShowAddMedia(true)}
        >
          Add photo/video
        </button>
        <button className="publish-button" onClick={handlePublishClick}>
          Publish
        </button>
      </div>
      {showAddMedia && (
        <AddMedia
          onClose={() => setShowAddMedia(false)}
          onImageUrlChange={handleImageUrlChange}
        />
      )}
    </div>
  );
}

export default Addtweet;
