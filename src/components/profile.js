import React, { useEffect, useState } from "react";
import defaultusersvg from "../img/user-circle-svgrepo-com (1).svg";
import defaultbanner from "../img/bannerdef.jpg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserProfileData } from "../firebaseUtils";
import "../styles/profile.css";

function Profile() {
  const [user, setUser] = useState(null);

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

  return (
    <div className="profile">
      <div className="header">
        <img alt="header"></img>
      </div>
      <div className="topDiv">
        <div className="avatarDiv">
          <img src={defaultusersvg} alt="user avatar" />
          <button className="edit-profile">Edit profile</button>
        </div>
      </div>
      {user && (
        <>
          <h1 className="name">{user.name}</h1>
          <h3 className="userid">Placeholder</h3>
          <p className="bio">
            Placeholder for bio, to decide maximum characters
          </p>
          <div className="infoDiv">
            <div className="positionDiv">
              <img alt="position icon" />{" "}
            </div>
            <div className="ageDiv">
              <img alt="age icon" />{" "}
            </div>
            <div className="genderDiv">
              <img alt="gender icon" />
            </div>
          </div>
          <div className="followerFollowingDiv">
            <p>{user.following}</p>
            <p>{user.followers}</p>
          </div>
          <div className="tweetsDiv">
            {/*Map throught the user tweet, order by timestamp */}
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
