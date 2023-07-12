import React, { useEffect, useState } from "react";
import defaultusersvg from "../img/user-circle-svgrepo-com (1).svg";
//import defaultbanner from "../img/bannerdef.jpg";
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
            {/*Map throught the user tweet, order by timestamp */}
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
