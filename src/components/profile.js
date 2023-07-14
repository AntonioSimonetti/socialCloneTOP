import React, { useEffect, useState } from "react";
import defaultusersvg from "../img/user-circle-svgrepo-com (1).svg";
//import defaultbanner from "../img/bannerdef.jpg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserProfileData, fetchUserTweets } from "../firebaseUtils";
import "../styles/profile.css";
import heartsvg from "../img/heart-svgrepo-com.svg";
import commentsvg from "../img/chat-round-svgrepo-com.svg";
import rtsvg from "../img/refresh-svgrepo-com.svg";

/*
https://www.svgrepo.com/collection/solar-bold-icons/19

https://www.svgrepo.com/svg/525369/heart
https://www.svgrepo.com/svg/525767/chat-round
https://www.svgrepo.com/svg/526143/refresh
*/

function Profile() {
  const [user, setUser] = useState(null);
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfileData = await fetchUserProfileData(user.uid);
        setUser(userProfileData);

        const userTweets = await fetchUserTweets();
        setTweets(userTweets.slice(-2));
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="profile">
      <div className="header">
        <img alt="header"></img>
      </div>
      <div className="topDiv">
        <div className="avatarDiv">
          <img src={user?.photoURL || defaultusersvg} alt="user avatar" />
          <button className="edit-profile">Edit profile</button>
        </div>
      </div>
      {user && (
        <>
          <div className="identificationDiv">
            <h1 className="name">{user.name}</h1>
            <p className="userid">Placeholder</p>
          </div>
          <p className="bio">
            Placeholder for bio, to decide maximum characters
          </p>
          <div className="infoDiv">
            {user.position && (
              <div className="positionDiv">
                <img alt="position icon" />
                <p>{user.position}</p>
              </div>
            )}
            {user.age && (
              <div className="ageDiv">
                <img alt="age icon" />
                <p>{user.age}</p>
              </div>
            )}
            {user.gender && (
              <div className="genderDiv">
                <img alt="gender icon" />
                <p>{user.gender}</p>
              </div>
            )}
          </div>
          <div className="followerFollowingDiv">
            <h3>Following:</h3>
            <p>{user.following}</p>
            <h3>Followers:</h3>
            <p>{user.followers}</p>
          </div>
          <div className="tweetsDiv">
            {tweets.map((tweet) => (
              <div key={tweet.key} className="tweet">
                <div className="topTweetDiv">
                  <h3>{user.name}</h3>
                  <p>idplaceholder</p>
                  <p>-</p>
                  <p>{tweet.timestamp}</p>
                </div>
                <div className="contentDiv">
                  <p>{tweet.content}</p>
                </div>

                <div className="reactionsDiv">
                  <div className="likesDiv">
                    <img src={heartsvg} alt="likeicon" />
                    <p>{tweet.likes}</p>
                  </div>
                  <div className="rtDiv">
                    <img src={rtsvg} alt="rticon" />
                    <p>{tweet.rt}</p>
                  </div>
                  <div className="commentsDiv">
                    <img src={commentsvg} alt="commenticon" />
                    <p>{tweet.comments}</p>
                  </div>
                </div>
              </div>
            ))}{" "}
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
