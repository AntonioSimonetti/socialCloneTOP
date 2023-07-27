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
  const currentTime = new Date();
  const date = currentTime.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = currentTime.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const userDocRef = doc(db, "users", userId);
  const userDocSnapshot = await getDoc(userDocRef);
  const userName = userDocSnapshot.data().name;

  const tweetData = {
    key: tweetKey,
    content: tweetContent,
    date: date,
    timestamp: time,
    likes: 0,
    rt: 0,
    comments: 0,
    name: userName,
    likedBy: [],
    rtBy: [],
    userId: userId,
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
        comments: tweetObj.comments,
        content: tweetObj.content,
        date: tweetObj.date,
        key: tweetObj.key,
        likedBy: tweetObj.likedBy,
        likes: tweetObj.likes,
        name: tweetObj.name,
        rt: tweetObj.rt,
        timestamp: tweetObj.timestamp,
        userId: tweetObj.userId,
        retweeted: tweetObj.retweeted,
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

    // Ordiniamo i tweet per data e, in caso di stessa data, per timestamp (in ordine decrescente)
    tweetsArray.sort((a, b) => {
      if (a.date === b.date) {
        return b.timestamp.localeCompare(a.timestamp);
      } else {
        return b.date.localeCompare(a.date);
      }
    });

    return tweetsArray;
  } catch (error) {
    console.error("Error fetching following users' tweets:", error);
    return [];
  }
};

const exploreTweets = async (exploreData) => {
  if (exploreData === null) {
    try {
      const db = getFirestore();
      const auth = getAuth();
      const userId = auth.currentUser.uid;

      // Step 1: Fetch all tweets from "usertweets" collection
      const q = query(collection(db, "usertweets"));
      const querySnapshot = await getDocs(q);

      const tweets = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.userId !== userId && Array.isArray(userData.tweets)) {
          tweets.push(...userData.tweets);
        }
      });

      // Step 2: Select random tweets from the fetched tweets
      const randomTweets = [];
      const totalTweets = tweets.length;
      const numberOfTweetsToShow = totalTweets;
      const indexes = new Set();

      while (indexes.size < numberOfTweetsToShow) {
        const randomIndex = Math.floor(Math.random() * totalTweets);
        if (!indexes.has(randomIndex)) {
          indexes.add(randomIndex);
          randomTweets.push(tweets[randomIndex]);
        }
      }

      return randomTweets;
    } catch (error) {
      console.error("Error fetching random tweets:", error);
    }
  } else {
    // Step 1: Fetch tweets from "usertweets" collection on the db using exploreData
    try {
      const db = getFirestore();
      const auth = getAuth();
      const userId = auth.currentUser.uid;

      const q = query(collection(db, "usertweets"));
      const querySnapshot = await getDocs(q);

      const tweets = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.userId !== userId && Array.isArray(userData.tweets)) {
          tweets.push(...userData.tweets);
        }
      });
      // Create a mapping of tweets in 'tweets' array using tweet keys as the mapping keys
      const tweetsMapping = {};
      tweets.forEach((tweet) => {
        tweetsMapping[tweet.key] = tweet;
      });

      //Replace each element in 'exploreData' with the corresponding tweet
      //from the 'tweetsMapping' to maintain the existing rendering order
      //but thanks to the fetching from the db with the interactions upgraded to the latest and in realtime
      const filteredTweets = exploreData.map((element) => {
        return tweetsMapping[element.key];
      });
      return filteredTweets;
    } catch (error) {
      console.error("Error fetching tweets from exploreData:", error);
    }
  }
};

const toggleLike = async (tweetId, userId) => {
  // Ottieni il riferimento al documento del tweet corrispondente

  const db = getFirestore();
  const userDocRef = doc(db, "usertweets", userId);
  const loggedUser = auth.currentUser.uid;

  // Ottieni il documento del tweet
  const tweetDoc = await getDoc(userDocRef);

  if (!tweetDoc.exists()) {
    console.log("Tweet non trovato!");
    return;
  }

  // Ottieni i dati del tweet dal documento
  const userData = tweetDoc.data();
  const tweetData = userData.tweets;
  const tweetIndex = tweetData.findIndex((tweet) => tweet.key === tweetId);

  if (tweetIndex === -1) {
    console.log("Tweet non trovato!");
    return;
  }

  const tweet = tweetData[tweetIndex];
  const isLiked = tweet.likedBy.includes(loggedUser);
  console.log(tweet);

  // Aggiungi o rimuovi l'userId dall'array likedby
  if (isLiked) {
    console.log(isLiked);
    const updatedLikedBy = tweet.likedBy.filter((id) => id !== loggedUser);
    const tweetsBefore = tweetData.slice(0, tweetIndex);
    const tweetsAfter = tweetData.slice(tweetIndex + 1);
    const updatedLikes = tweet.likes - 1;

    // Unire gli oggetti tweet precedenti, l'oggetto tweet modificato e gli oggetti tweet successivi
    const updatedTweets = [
      ...tweetsBefore,
      { ...tweet, likedBy: updatedLikedBy, likes: updatedLikes },
      ...tweetsAfter,
    ];

    console.log("updatedTweets minus 1", updatedTweets);

    // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
    await updateDoc(userDocRef, { tweets: updatedTweets });
  } else {
    const updatedLikedBy = [...tweet.likedBy, loggedUser];
    console.log(updatedLikedBy);

    // Creare una copia degli oggetti tweet precedenti l'oggetto specifico
    const tweetsBefore = tweetData.slice(0, tweetIndex);

    // Creare una copia degli oggetti tweet che si trovano dopo l'oggetto specifico
    const tweetsAfter = tweetData.slice(tweetIndex + 1);

    // Aggiornare il parametro likes nell'oggetto tweet corrispondente
    const updatedLikes = tweet.likes + 1;

    // Unire gli oggetti tweet precedenti, l'oggetto tweet modificato con il valore likes aggiornato e gli oggetti tweet successivi
    const updatedTweets = [
      ...tweetsBefore,
      { ...tweet, likedBy: updatedLikedBy, likes: updatedLikes },
      ...tweetsAfter,
    ];
    console.log("updatedTweets plus 1", updatedTweets);

    // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
    await updateDoc(userDocRef, { tweets: updatedTweets });
  }
};

const toggleRt = async (tweetId, userId) => {
  //Ottieni il riferimento al documento del tweet corrispondente
  const db = getFirestore();
  const userDocRef = doc(db, "usertweets", userId);

  //utente che retweet
  const loggedUser = auth.currentUser.uid;

  //Ottieni il riferimento al documento dell user che retwitta
  const userTweetsRef = doc(db, "usertweets", loggedUser);
  const retweetDoc = await getDoc(userTweetsRef);
  const retweetData = retweetDoc.data();

  // Ottieni il documento del tweet
  const tweetDoc = await getDoc(userDocRef);

  if (!tweetDoc.exists()) {
    console.log("Tweet non trovato!");
    return;
  }

  // Ottieni i dati del tweet dal documento
  const userData = tweetDoc.data();
  const tweetData = userData.tweets;
  const tweetIndex = tweetData.findIndex((tweet) => tweet.key === tweetId);

  if (tweetIndex === -1) {
    console.log("Tweet non trovato!");
    return;
  }

  const tweet = tweetData[tweetIndex];
  console.log("tweet", tweet);
  console.log("loggeduser", loggedUser);

  const isRt = tweet.rtBy ? tweet.rtBy.includes(loggedUser) : false;
  console.log("isRt", isRt);

  // Aggiungi o rimuovi l'userId dall'array likedby
  if (isRt) {
    const updatedRtBy = tweet.rtBy.filter((id) => id !== loggedUser);
    const tweetsBefore = tweetData.slice(0, tweetIndex);
    const tweetsAfter = tweetData.slice(tweetIndex + 1);
    const updatedRt = tweet.rt - 1;

    // Unire gli oggetti tweet precedenti, l'oggetto tweet modificato e gli oggetti tweet successivi
    const updatedTweets = [
      ...tweetsBefore,
      { ...tweet, rtBy: updatedRtBy, rt: updatedRt },
      ...tweetsAfter,
    ];

    // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
    await updateDoc(userDocRef, { tweets: updatedTweets });

    // Rimuovi anche il tweet da retweetData per il documento dell'utente che retwitta
    const updatedRetweetData = {
      ...retweetData,
      tweets: retweetData.tweets.filter((tweet) => tweet.key !== tweetId),
    };
    await updateDoc(userTweetsRef, updatedRetweetData);
  } else {
    const updatedRtBy = [...tweet.rtBy, loggedUser];
    console.log("updatedRtBy", updatedRtBy);

    // Creare una copia degli oggetti tweet precedenti l'oggetto specifico
    const tweetsBefore = tweetData.slice(0, tweetIndex);
    // Creare una copia degli oggetti tweet che si trovano dopo l'oggetto specifico
    const tweetsAfter = tweetData.slice(tweetIndex + 1);

    // Aggiornare il parametro likes nell'oggetto tweet corrispondente
    const updatedRt = tweet.rt + 1;

    // Unire gli oggetti tweet precedenti, l'oggetto tweet modificato con il valore likes aggiornato e gli oggetti tweet successivi
    const updatedTweets = [
      ...tweetsBefore,
      { ...tweet, rtBy: updatedRtBy, rt: updatedRt },
      ...tweetsAfter,
    ];

    // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
    await updateDoc(userDocRef, { tweets: updatedTweets });

    // Aggiungi anche il tweet a retweetData per il documento dell'utente che retwitta
    const updatedRetweetData = {
      ...retweetData,
      tweets: [
        ...retweetData.tweets,
        {
          ...tweet,
          rtBy: [loggedUser],
          likedBy: [],
          retweeted: true,
          likes: 0,
          comments: 0,
          rt: 0,
        },
      ],
    };
    console.log("updatedRetData", updatedRetweetData);
    await updateDoc(userTweetsRef, updatedRetweetData);
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
  exploreTweets,
  toggleLike,
  toggleRt,
  auth,
};
