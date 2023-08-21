import React, { useEffect, useState } from "react";
import defaultusersvg from "../img/user-circle-svgrepo-com (1).svg";
import { fetchUserTweets, followUser } from "../firebaseUtils";
import "../styles/profile.css";
import ProfileTweetsSearch from "./profiletweetssearch";
import postionsvg from "../img/map-point-wave.svg";
import agesvg from "../img/calendar.svg";
import gendersvg from "../img/gender.svg";

function ProfileSearch({ documentId, user }) {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    if (documentId) {
      fetchUserTweets(documentId).then((userTweets) => {
        setTweets(userTweets.slice(-2));
      });
    }
    console.log("42", user);
  }, [documentId]);

  return (
    <div className="profile">
      <div className="header">
        <img alt="header"></img>
      </div>
      <div className="topDiv">
        <div className="avatarDiv">
          <img src={user?.photoURL || defaultusersvg} alt="user avatar" />
          <button className="edit-profile" onClick={() => followUser(user)}>
            FollUnffoll
          </button>
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
            <div className="positionDiv">
              <img src={postionsvg} alt="position icon" />
              <p>{user.position || "not specified"}</p>
            </div>
            <div className="ageDiv">
              <img src={agesvg} alt="age icon" />
              <p>{user.age || "not specified"}</p>
            </div>
            <div className="genderDiv">
              <img src={gendersvg} alt="gender icon" />
              <p>{user.gender || "not specified"}</p>
            </div>
          </div>
          <div className="followerFollowingDiv">
            <h3>Following:</h3>
            <p>{user.following}</p>
            <h3>Followers:</h3>
            <p>{user.followers}</p>
          </div>
          <ProfileTweetsSearch documentId={documentId} user={user} />
        </>
      )}
    </div>
  );
}

export default ProfileSearch;
