import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  // createUserWithEmailAndPassword,
  // signInWithEmailAndPassword,
  // signOut,
  // sendPasswordResetEmail,
} from "firebase/auth";
import "firebase/firestore";
import { firebaseConfig } from "./firebase";

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// funzione per creare l'user
const createUserDocument = async (user) => {
  const usersCollectionRef = doc(db, "users", user.uid);

  const { name, email, position, age, photoURL } = user;

  const userData = {
    name,
    email,
    position,
    age,
    photoURL,
    gender: null,
    bio: null,
    avatar: null,
    interest: null,
    following: 0,
    followers: 0,
  };
  await setDoc(usersCollectionRef, userData);

  // not sure yet i will keep this
  return user.uid;
};

const fetchUserProfileData = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    return userSnapshot.data();
  } else {
    return null;
  }
};

// Funzione per l'accesso con Google
const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
};

const signInWithGoogleAndCreateUser = async () => {
  try {
    const result = await signInWithGoogle();
    console.log(result);
    const user = {
      uid: result.user.uid,
      name: result.user.displayName,
      email: result.user.email,
      position: null,
      age: null,
    };
    await createUserDocument(user);
    // Resto del codice da eseguire dopo aver salvato l'utente nel databas
  } catch (error) {
    console.log("Errore durante l'accesso con Google:", error);
  }
};

//create tweet
const addTweet = async (tweetContent) => {
  const auth = getAuth();
  const userId = auth.currentUser.uid;

  const db = getFirestore();
  const userTweetsDocRef = doc(db, "usertweets", userId);
  const tweetKey = doc(collection(db, "usertweets", userId, "tweets")).id; // Genera una chiave unica
  const timestamp = new Date().getTime();

  const tweetData = {
    key: tweetKey,
    content: tweetContent,
    timestamp: new Date(timestamp).toLocaleString(),
    likes: 0,
    rt: 0,
    comments: 0,
  };

  try {
    const userTweetsDocSnapshot = await getDoc(userTweetsDocRef);

    if (userTweetsDocSnapshot.exists()) {
      await updateDoc(userTweetsDocRef, {
        tweets: [...userTweetsDocSnapshot.data().tweets, tweetData],
      });
      console.log("Tweet added to existing document.");
    } else {
      await setDoc(userTweetsDocRef, { tweets: [tweetData] });
      console.log("New document created with the tweet.");
    }

    // Log, to be removed
    const createdUserSnapshot = await getDoc(userTweetsDocRef);
    const createdUserData = createdUserSnapshot.data();
    console.log("New user created:", createdUserData);

    console.log("Tweet added successfully.");
  } catch (error) {
    console.error("Error adding tweet: ", error);
  }
};

const fetchUserTweets = async (limit) => {
  const auth = getAuth();
  const userId = auth.currentUser.uid;

  const db = getFirestore();
  const userTweetsDocRef = doc(db, "usertweets", userId);

  try {
    const userTweetsDocSnapshot = await getDoc(userTweetsDocRef);

    if (userTweetsDocSnapshot.exists()) {
      const userTweetsData = userTweetsDocSnapshot.data();

      const tweets = userTweetsData.tweets.slice(-limit).map((tweetObj) => ({
        content: tweetObj.content,
        timestamp: tweetObj.timestamp,
      }));

      return tweets;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching user tweets: ", error);
    return [];
  }
};

const fetchUserSearch = async (searchText) => {
  const usersCollectionRef = collection(db, "users");

  try {
    const querySnapshot = await getDocs(
      query(usersCollectionRef, where("name", ">=", searchText))
    );

    const searchResults = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return searchResults;
  } catch (error) {
    console.error("Error fetching user search results: ", error);
    return [];
  }
};

const fetchUserTweetsIn = async (documentName) => {
  const db = getFirestore();
  const userTweetsDocRef = doc(db, "usertweets", documentName);

  try {
    const userTweetsDocSnapshot = await getDoc(userTweetsDocRef);

    if (userTweetsDocSnapshot.exists()) {
      const userTweetsData = userTweetsDocSnapshot.data();

      const tweetsArray = userTweetsData.tweets;

      return tweetsArray;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching user tweets: ", error);
    return [];
  }
};

const followUser = async (userToFollow) => {
  const auth = getAuth();
  const loggedInUserId = auth.currentUser.uid;

  try {
    const db = getFirestore();

    // Aggiungiamo l'utente che segue all'array followerArray dell'utente seguito
    const userToFollowRef = doc(db, "users", userToFollow.id);
    const userToFollowSnapshot = await getDoc(userToFollowRef);
    const userToFollowData = userToFollowSnapshot.data();

    const userIsFollowing = userToFollowData.followerArray
      ? userToFollowData.followerArray.includes(loggedInUserId)
      : false;

    if (!userIsFollowing) {
      await updateDoc(userToFollowRef, {
        followerArray: [
          ...(userToFollowData.followerArray || []),
          loggedInUserId,
        ],
        followers: (userToFollowData.followers || 0) + 1,
      });
      console.log("User added to followerArray.");
    } else {
      // Rimuovi l'utente che segue dall'array followerArray
      const updatedFollowerArray = userToFollowData.followerArray.filter(
        (id) => id !== loggedInUserId
      );
      await updateDoc(userToFollowRef, {
        followerArray: updatedFollowerArray,
        followers:
          userToFollowData.followers > 0 ? userToFollowData.followers - 1 : 0,
      });
      console.log("User removed from followerArray.");
    }

    // Ora possiamo eseguire le stesse operazioni sull'utente loggato come abbiamo fatto prima
    const loggedInUserRef = doc(db, "users", loggedInUserId);
    const loggedInUserSnapshot = await getDoc(loggedInUserRef);
    const loggedInUserData = loggedInUserSnapshot.data();

    const loggedInUserIsFollowing = loggedInUserData.whoFollowing
      ? loggedInUserData.whoFollowing.some(
          (user) => user.id === userToFollow.id
        )
      : false;

    if (loggedInUserIsFollowing) {
      // Rimuovi l'utente da seguire dall'array
      const updatedWhoFollowing = loggedInUserData.whoFollowing.filter(
        (user) => user.id !== userToFollow.id
      );
      await updateDoc(loggedInUserRef, {
        whoFollowing: updatedWhoFollowing,
        following:
          loggedInUserData.following > 0 ? loggedInUserData.following - 1 : 0,
      });
      console.log("User removed from whoFollowing array.");
    } else {
      // Aggiungi l'utente da seguire all'array
      await updateDoc(loggedInUserRef, {
        whoFollowing: [...(loggedInUserData.whoFollowing || []), userToFollow],
        following: (loggedInUserData.following || 0) + 1,
      });
      console.log("User added to whoFollowing array.");
    }
  } catch (error) {
    console.error("Error following user: ", error);
  }
};

const fetchFollowingUsersTweets = async () => {
  const auth = getAuth();
  const loggedInUserId = auth.currentUser.uid;

  const db = getFirestore();
  const loggedInUserRef = doc(db, "users", loggedInUserId);
  const loggedInUserSnapshot = await getDoc(loggedInUserRef);

  if (!loggedInUserSnapshot.exists()) {
    console.error("User not found.");
    return [];
  }

  const loggedInUserData = loggedInUserSnapshot.data();

  if (
    !loggedInUserData.whoFollowing ||
    loggedInUserData.whoFollowing.length === 0
  ) {
    console.log("User is not following anyone.");
    return [];
  }

  try {
    const followingUsersIds = loggedInUserData.whoFollowing.map(
      (user) => user.id
    );

    // Query per ottenere i tweet degli utenti seguiti
    const querySnapshot = await getDocs(
      query(
        collection(db, "usertweets"),
        where("__name__", "in", followingUsersIds)
      )
    );

    const tweetsArray = [];

    querySnapshot.forEach((doc) => {
      const userTweetsData = doc.data();
      tweetsArray.push(...userTweetsData.tweets);
    });

    // Ordiniamo i tweet per timestamp in ordine decrescente (dal più recente al meno recente)
    tweetsArray.sort((a, b) => b.timestamp - a.timestamp);

    console.log(tweetsArray);

    return tweetsArray;
  } catch (error) {
    console.error("Error fetching following users' tweets:", error);
    return [];
  }
};

export {
  createUserDocument,
  fetchUserProfileData,
  signInWithGoogleAndCreateUser,
  addTweet,
  fetchUserTweets,
  fetchUserSearch,
  fetchUserTweetsIn,
  followUser,
  fetchFollowingUsersTweets,
};
