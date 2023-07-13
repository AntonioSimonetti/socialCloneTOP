import React, { useEffect, useState } from "react";
import defaultusersvg from "../img/user-circle-svgrepo-com (1).svg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserProfileData, addTweet } from "../firebaseUtils";
import "../styles/addtweet.css";

function Addtweet() {
  const [user, setUser] = useState(null);
  const [tweetContent, setTweetContent] = useState("");

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

  const handleTweetContentChange = (e) => {
    setTweetContent(e.target.value);
  };

  const handlePublishClick = () => {
    if (tweetContent.trim() !== "") {
      addTweet(tweetContent);
      setTweetContent("");
    }
  };

  return (
    <div className="add-tweet">
      <div className="input-field">
        <div className="avatar">
          <img src={user?.photoURL || defaultusersvg} alt="user avatar" />
        </div>
        <textarea
          type="text"
          placeholder="Scrivi il tuo tweet"
          value={tweetContent}
          onChange={handleTweetContentChange}
        />
      </div>
      <div className="buttons">
        <button className="add-media-button">Add photo/video</button>
        <button className="publish-button" onClick={handlePublishClick}>
          Publish
        </button>
      </div>
    </div>
  );
}

export default Addtweet;
