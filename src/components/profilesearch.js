import React, { useEffect, useState } from "react";
import defaultusersvg from "../img/user-circle-svgrepo-com (1).svg";
import {
  fetchUserTweets,
  followUser,
  getBackgroundColor,
  getImageProfile,
  whoFollowing,
} from "../firebaseUtils";
import "../styles/profile.css";
import ProfileTweetsSearch from "./profiletweetssearch";
import postionsvg from "../img/map-point-wave.svg";
import agesvg from "../img/calendar.svg";
import gendersvg from "../img/gender.svg";

function ProfileSearch({ documentId, user }) {
  const [tweets, setTweets] = useState([]);
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState("#ffffff");
  const [imageUrl, setImageUrl] = useState(null);
  const [areYouFollowing, setAreYouFollowing] = useState(false);

  useEffect(() => {
    // Fetch the user's background color and update the state
    const fetchYouFollowHim = async () => {
      const areYou = await whoFollowing(user.id);
      setAreYouFollowing(areYou);
    };

    fetchYouFollowHim();
  }, []);

  useEffect(() => {
    // Fetch the user's background color and update the state
    const fetchBackgroundColor = async () => {
      const userBackgroundColor = await getBackgroundColor(user.id);
      setHeaderBackgroundColor(userBackgroundColor);
      const userProfileImage = await getImageProfile(user.id, imageUrl);
      setImageUrl(userProfileImage);
    };

    fetchBackgroundColor();
  }, []);

  useEffect(() => {
    if (documentId) {
      fetchUserTweets(documentId).then((userTweets) => {
        setTweets(userTweets.slice(-2));
      });
    }
  }, [documentId]);

  return (
    <div className="profile">
      <div
        className="header"
        style={{ backgroundColor: headerBackgroundColor }}
      ></div>
      <div className="topDiv">
        <div className="avatarDiv">
          <div className="avatarWrapper">
            <img
              src={imageUrl || user?.photoURL || defaultusersvg}
              alt="user avatar"
            />{" "}
          </div>
          <button className="edit-profile" onClick={() => followUser(user)}>
            {areYouFollowing ? "Unfollow" : "Follow"}
          </button>
        </div>
      </div>
      {user && (
        <>
          <div className="identificationDiv">
            <h1 className="name">{user.name}</h1>
            <p className="userid">@{user.userId}</p>
          </div>
          <p className="bio">{user.bio}</p>
          <div className="infoDivProfile">
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
