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
  writeBatch,
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
          const filteredTweets = userData.tweets.filter(
            (tweet) => !tweet.hasOwnProperty("originalId")
          );
          tweets.push(...filteredTweets);
        }
      });

      const uniqueTweets = [];
      const seenIds = new Set();

      tweets.forEach((tweet) => {
        if (!seenIds.has(tweet.key)) {
          seenIds.add(tweet.key);
          uniqueTweets.push(tweet);
        }
      });

      // Step 2: Select random tweets from the fetched tweets
      const randomTweets = [];
      const totalTweets = uniqueTweets.length;
      const numberOfTweetsToShow = totalTweets;
      const indexes = new Set();

      while (indexes.size < numberOfTweetsToShow) {
        const randomIndex = Math.floor(Math.random() * totalTweets);
        if (!indexes.has(randomIndex)) {
          indexes.add(randomIndex);
          randomTweets.push(uniqueTweets[randomIndex]);
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
          const filteredTweets = userData.tweets.filter(
            (tweet) => !tweet.hasOwnProperty("originalId")
          );
          tweets.push(...filteredTweets);
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
  console.log("tweetkey", tweetId);
  console.log("user.uid", userId);

  const db = getFirestore();
  const userDocRef = doc(db, "usertweets", userId);
  const loggedUser = auth.currentUser.uid;

  // Ottieni il documento del tweet
  const tweetDoc = await getDoc(userDocRef);

  if (!tweetDoc.exists()) {
    console.log("Tweet non trovato1!");
    return;
  }

  // Ottieni i dati del tweet dal documento
  const userData = tweetDoc.data();
  const tweetData = userData.tweets;
  const tweetIndex = tweetData.findIndex((tweet) => tweet.key === tweetId);

  //questa funzione con i rt non funzionava perchè il db è compromesso, da rifare a mano

  if (tweetIndex === -1) {
    const userDocRef2 = collection(db, "usertweets");
    const querySnapshot = await getDocs(userDocRef2);

    let targetedTweet;
    let documentId;
    let arrayTweet = [];

    querySnapshot.forEach((doc) => {
      // Ogni "doc" rappresenta un documento nella collezione "usertweets"
      const userData = doc.data();
      const tweetData = userData.tweets;
      console.log("tweetData", tweetData);
      const tweet = tweetData.find((tweet) => tweet.key === tweetId);
      console.log("tweet", tweet);

      if (tweet) {
        targetedTweet = tweet;
        documentId = doc.id;
        arrayTweet.push(...tweetData);
      }
    });

    const tweetIndex = arrayTweet.findIndex((tweet) => tweet.key === tweetId);

    console.log(targetedTweet);
    console.log(documentId);

    let arrayToModify = arrayTweet;
    const isLiked = targetedTweet.likedBy.includes(loggedUser);
    console.log(isLiked);
    const recipientUserDocRef = doc(db, "usertweets", documentId);
    console.log("targetedTweet", targetedTweet);
    console.log("arraytomodify", arrayToModify);

    if (isLiked) {
      console.log("Il like è già presente. Rimuovendo il like...");

      const updatedLikedBy = targetedTweet.likedBy.filter(
        (id) => id !== loggedUser
      );

      const tweetsBefore = tweetData.slice(0, tweetIndex);
      const tweetsAfter = tweetData.slice(tweetIndex + 1);
      const updatedLikes = targetedTweet.likes - 1;

      console.log("updatedLikedBy", updatedLikedBy);
      console.log("bef", tweetsBefore);
      console.log("targ", targetedTweet);
      console.log("aft", tweetsAfter);

      const updatedTweets = [
        ...tweetsBefore,
        { ...targetedTweet, likedBy: updatedLikedBy, likes: updatedLikes },
        ...tweetsAfter,
      ];
      console.log("updatedTweets con like rimosso al rt", updatedTweets);

      // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
      await updateDoc(recipientUserDocRef, { tweets: updatedTweets });
    } else {
      console.log("Il like non è presente. Aggiungendo il like...");
      const updatedLikedBy = [...targetedTweet.likedBy, loggedUser];
      const tweetsBefore = arrayToModify.slice(0, tweetIndex);
      const tweetsAfter = arrayToModify.slice(tweetIndex + 1);
      const updatedLikes = targetedTweet.likes + 1;

      console.log("aggiungo", tweetsBefore, tweetsAfter, updatedLikes);

      const updatedTweets = [
        ...tweetsBefore,
        { ...targetedTweet, likedBy: updatedLikedBy, likes: updatedLikes },
        ...tweetsAfter,
      ];
      console.log("updatedTweets con like aggiunto al rt", updatedTweets);

      // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
      await updateDoc(recipientUserDocRef, { tweets: updatedTweets });
    }
    console.log("fine toggle like di un rt");
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

//Da aggiungere il blocco al rt di ogni tuo post o gestire l'eliminazione del rt ad il tuo post
const toggleRt = async (tweetId, userId) => {
  const db = getFirestore();
  const userDocRef = doc(db, "usertweets", userId);
  //LOGIC TO NOT ALLOW RT OF YOUR OWN POST AND RT
  //da aggiungere classe o pseudo classe per dare feedback all user
  //user che fa il post può retwittare il post tutte le volte che vuole
  //crea quindi altri rt ma il numero di rt a quel post non aumenta

  const userDocAll = collection(db, "usertweets");
  const querySnapshotAll = await getDocs(userDocAll);

  let uniqueTweet;
  let uniqueArrayTweet = [];

  let foundOwnRt = false;

  querySnapshotAll.forEach((doc) => {
    const userData = doc.data();
    const tweetData = userData.tweets;
    const tweet = tweetData.find((tweet) => tweet.key === tweetId);

    if (tweet) {
      uniqueTweet = tweet;
      uniqueArrayTweet.push(...tweetData);
    }
  });

  console.log(uniqueTweet);

  let originalId = uniqueTweet.originalId;
  const loggedUserRt = auth.currentUser.uid;

  if (uniqueTweet.userId === loggedUserRt) {
    foundOwnRt = true;
    console.log("non puoi rt un tuo stesso post");
  }

  querySnapshotAll.forEach((doc) => {
    const userData = doc.data();
    const tweetData = userData.tweets;
    const tweet = tweetData.find((tweet) => tweet.key === originalId);

    if (tweet) {
      if (tweet.userId === loggedUserRt) {
        console.log(tweet);
        console.log("non puoi retwittare un tuo rt");
        foundOwnRt = true;
      }
    }
  });

  if (foundOwnRt || uniqueTweet.deleted) {
    return; // Esce completamente dalla funzione
  }
  console.log("questo non lo vedi");
  //END LOGIC TO NOT ALLOW RT OF YOUR OWN POST AND RT

  //utente che retweet
  const loggedUser = auth.currentUser.uid;
  const userDocRefName = doc(db, "users", loggedUser);
  const nameDocData = await getDoc(userDocRefName);
  const loggedUserData = nameDocData.data();
  const loggedUserName = loggedUserData.name;

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
    console.log("index -1");
    const userDocRefAll = collection(db, "usertweets");
    const querySnapshot = await getDocs(userDocRefAll);

    let targetedTweet;
    let documentId;
    let arrayTweet = [];

    querySnapshot.forEach((doc) => {
      // Ogni "doc" rappresenta un documento nella collezione "usertweets"
      const userData = doc.data();
      const tweetData = userData.tweets;
      const tweet = tweetData.find((tweet) => tweet.key === tweetId);

      if (tweet) {
        targetedTweet = tweet;
        documentId = doc.id;
        arrayTweet.push(...tweetData);
      }
    });
    const recipientUserDocRef = doc(db, "usertweets", documentId);
    const retweetIndex = arrayTweet.findIndex((tweet) => tweet.key === tweetId);
    const isRt = targetedTweet.rtBy
      ? targetedTweet.rtBy.includes(loggedUser)
      : false;
    console.log(isRt);
    if (isRt) {
      let targetedTweetTwo;
      let documentIdTwo;
      let arrayTweetTwo = [];
      let retweetIndexTwo = -1;

      querySnapshot.forEach((doc) => {
        // Ogni "doc" rappresenta un documento nella collezione "usertweets"
        const userData = doc.data();
        const tweetData = userData.tweets;
        const tweet = tweetData.find(
          (tweet) => tweet.key === targetedTweet.originalId
        );

        if (tweet) {
          targetedTweetTwo = tweet;
          console.log(targetedTweetTwo);
          documentIdTwo = doc.id;
          arrayTweetTwo.push(...tweetData);
          retweetIndexTwo = arrayTweetTwo.indexOf(targetedTweetTwo);
          console.log(retweetIndexTwo, "ciao");
        }
      });

      const recipientUserDocRefTwo = doc(db, "usertweets", documentIdTwo);
      console.log("targetedTweetTwo", targetedTweetTwo);
      console.log(arrayTweetTwo);

      //logica per rimuovere
      const updatedRtByTwo = targetedTweetTwo.rtBy.filter(
        (id) => id !== loggedUser
      );
      const tweetsBeforeTwo = arrayTweetTwo.slice(0, retweetIndexTwo);
      console.log("TweetsBeforeTwo", tweetsBeforeTwo);
      const tweetsAfterTwo = arrayTweetTwo.slice(retweetIndexTwo + 1);
      console.log("TweetsAfterTwo", tweetsAfterTwo);
      console.log("retweetIndexTwo", retweetIndexTwo);

      const updatedRtTwo = targetedTweetTwo.rt - 1;

      // Unire gli oggetti tweet precedenti, l'oggetto tweet modificato e gli oggetti tweet successivi
      const updatedTweets = [
        ...tweetsBeforeTwo,
        { ...targetedTweetTwo, rtBy: updatedRtByTwo, rt: updatedRtTwo },
        ...tweetsAfterTwo,
      ];

      console.log("updatedTweets", updatedTweets);

      await updateDoc(recipientUserDocRefTwo, { tweets: updatedTweets });

      // Togli anche il tweet al documento dell'utente che retwitta
      const keepTweets = arrayTweet.filter((tweet) => tweet.key !== tweetId);

      await updateDoc(userTweetsRef, { tweets: keepTweets });
    } else {
      const updatedRtBy = [...targetedTweet.rtBy, loggedUser];
      // Creare una copia degli oggetti tweet precedenti l'oggetto specifico
      const tweetsBefore = arrayTweet.slice(0, retweetIndex);
      // Creare una copia degli oggetti tweet che si trovano dopo l'oggetto specifico
      const tweetsAfter = arrayTweet.slice(retweetIndex + 1);
      // Aggiornare il parametro likes nell'oggetto tweet corrispondente
      const updatedRt = targetedTweet.rt + 1;
      // Unire gli oggetti tweet precedenti, l'oggetto tweet modificato con il valore likes aggiornato e gli oggetti tweet successivi
      const updatedTweets = [
        ...tweetsBefore,
        { ...targetedTweet, rtBy: updatedRtBy, rt: updatedRt },
        ...tweetsAfter,
      ];
      // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
      await updateDoc(recipientUserDocRef, { tweets: updatedTweets });

      // Aggiungi anche il tweet al documento dell'utente che retwitta
      const tweetKey = doc(collection(db, "usertweets", userId, "tweets")).id; // Genera una chiave unica
      const updatedRetweetData = {
        ...retweetData,
        tweets: [
          ...retweetData.tweets,
          {
            ...targetedTweet,
            key: tweetKey,
            rtBy: [loggedUser],
            likedBy: [],
            retweeted: true,
            likes: 0,
            comments: 0,
            rt: 0,
            rtName: loggedUserName,
            originalId: targetedTweet.key,
          },
        ],
      };
      await updateDoc(userTweetsRef, updatedRetweetData);
    }

    return;
  }

  const tweet = tweetData[tweetIndex];
  const isRt = tweet.rtBy ? tweet.rtBy.includes(loggedUser) : false;

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
      tweets: retweetData.tweets.filter(
        (tweet) => tweet.originalId !== tweetId
      ),
    };
    await updateDoc(userTweetsRef, updatedRetweetData);
  } else {
    const updatedRtBy = [...tweet.rtBy, loggedUser];

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
    const tweetKey = doc(collection(db, "usertweets", userId, "tweets")).id; // Genera una chiave unica

    const updatedRetweetData = {
      ...retweetData,
      tweets: [
        ...retweetData.tweets,
        {
          ...tweet,
          key: tweetKey,
          rtBy: [loggedUser],
          likedBy: [],
          retweeted: true,
          likes: 0,
          comments: 0,
          rt: 0,
          rtName: loggedUserName,
          originalId: tweet.key,
        },
      ],
    };
    await updateDoc(userTweetsRef, updatedRetweetData);
  }
};

//function to remove tweets
const removeTweet = async (tweetId, userId) => {
  // Ottieni il riferimento al documento del tweet corrispondente
  console.log("eseguita");
  console.log("tweetId", tweetId);
  console.log("userId", userId);

  const db = getFirestore();
  const userDocRef = doc(db, "usertweets", userId);

  // Ottieni il documento del tweet
  const tweetDoc = await getDoc(userDocRef);

  // Ottieni i dati del tweet dal documento
  const userData = tweetDoc.data();
  const tweetData = userData.tweets;

  // Filtra l'array tweetData per rimuovere il tweet con la chiave tweetId
  const updatedTweets = tweetData.filter((tweet) => tweet.key !== tweetId);

  // Aggiorna il database
  await updateDoc(userDocRef, { tweets: updatedTweets });

  // Cerca tutti i documenti nella collezione "usertweets"
  const querySnapshot = await getDocs(collection(db, "usertweets"));

  // Per ogni documento, cerca e aggiorna i tweet con originalId uguale a tweetId
  const batch = writeBatch(db);
  querySnapshot.forEach((doc) => {
    const userData = doc.data();
    const tweetData = userData.tweets;

    const updatedTweetsTwo = tweetData.map((tweet) => {
      if (tweet.originalId === tweetId) {
        return { ...tweet, content: "deleted tweet", deleted: true };
      }
      return tweet;
    });

    batch.update(doc.ref, { tweets: updatedTweetsTwo });
  });

  // Esegui le operazioni di aggiornamento nel batch
  await batch.commit();

  const targetedTweet = tweetData.find((tweet) => tweet.key === tweetId);
  const targetTweetOriginalId = targetedTweet.originalId;

  if (targetedTweet.retweeted) {
    const batchTwo = writeBatch(db);

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const tweetData = userData.tweets;

      const updatedTweetsThree = tweetData.map((tweet) => {
        if (tweet.key === targetTweetOriginalId) {
          return { ...tweet, rt: tweet.rt - 1 };
        }
        return tweet;
      });
      batchTwo.update(doc.ref, { tweets: updatedTweetsThree });
    });

    await batchTwo.commit();
  }
};

const editProfile = async (user, updateData) => {
  console.log(user.position);
  console.log(user.age);
  console.log(user.gender);
  console.log(user.bio);

  const auth = getAuth();
  const userID = auth.currentUser.uid;
  const db = getFirestore();
  const userDocRef = doc(db, "users", userID);
  console.log(userDocRef);

  // Ottieni il documento del tweet
  const tweetDoc = await getDoc(userDocRef);

  // Ottieni i dati del tweet dal documento
  const userData = tweetDoc.data();

  const updatedUserData = {
    ...userData,
    position: updateData.position,
    age: updateData.age,
    bio: updateData.bio,
    gender: updateData.gender,
  };

  console.log(updatedUserData);
  await updateDoc(userDocRef, updatedUserData);
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
  removeTweet,
  editProfile,
  auth,
};
