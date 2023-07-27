import React, { useEffect, useState } from "react";
import defaultusersvg from "../img/user-circle-svgrepo-com (1).svg";
//import defaultbanner from "../img/bannerdef.jpg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserProfileData, fetchUserTweets } from "../firebaseUtils";
import "../styles/profile.css";
import Profiletweets from "./profiletweets";

import postionsvg from "../img/map-point-wave.svg";
import agesvg from "../img/calendar.svg";
import gendersvg from "../img/gender.svg";

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
            <div className="positionDiv">
              <img src={postionsvg} alt="position icon" />
              <p>{user.position}</p>
            </div>
            <div className="ageDiv">
              <img src={agesvg} alt="age icon" />
              <p>{user.age}</p>
            </div>
            <div className="genderDiv">
              <img src={gendersvg} alt="gender icon" />
              <p>{user.gender}</p>
            </div>
          </div>
          <div className="followerFollowingDiv">
            <h3>Following:</h3>
            <p>{user.following}</p>
            <h3>Followers:</h3>
            <p>{user.followers}</p>
          </div>
          <Profiletweets user={user} />
        </>
      )}
    </div>
  );
}

export default Profile;
