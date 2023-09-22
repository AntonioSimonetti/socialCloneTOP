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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "firebase/firestore";
import { firebaseConfig } from "./firebase";
import { v4 as uuidv4 } from "uuid";

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
    userId: user.uid,
  };
  await setDoc(usersCollectionRef, userData);

  // not sure yet i will keep this
  return user.uid;
};

const storage = getStorage(app);

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
      photoURL: result.user.photoURL,
    };
    await createUserDocument(user);

    console.log("Utente creato con successo:", user);
  } catch (error) {
    console.log("Errore durante l'accesso con Google:", error);
  }
};

//create tweet
const addTweet = async (tweetContent, imageUrl) => {
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
    comments: [],
    name: userName,
    likedBy: [],
    rtBy: [],
    userId: userId,
    imageUrl: imageUrl,
  };

  try {
    const userTweetsDocSnapshot = await getDoc(userTweetsDocRef);

    if (userTweetsDocSnapshot.exists()) {
      await updateDoc(userTweetsDocRef, {
        tweets: [...userTweetsDocSnapshot.data().tweets, tweetData],
      });
    } else {
      await setDoc(userTweetsDocRef, { tweets: [tweetData] });
    }
    // Log, to be removed
  } catch (error) {
    console.error("Error adding tweet: ", error);
  }
};

const fetchUserTweets = async (limit) => {
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
        imageUrl: tweetObj.imageUrl,
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
    let queryText = searchText;

    if (searchText.charAt(0) === "@") {
      // If it starts with "@", remove "@" for the query
      queryText = searchText.substring(1);

      const querySnapshot = await getDocs(
        query(usersCollectionRef, where("userId", ">=", queryText))
      );

      const searchResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return searchResults;
    }

    const querySnapshot = await getDocs(
      query(usersCollectionRef, where("name", ">=", queryText))
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
  const loggedInUserId = auth.currentUser.uid;

  if (userToFollow.id === loggedInUserId) {
    return console.log("you cant follow yourself!");
  }

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
      addNotification(userToFollow.id, "follower", userToFollow);
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
    } else {
      // Aggiungi l'utente da seguire all'array
      await updateDoc(loggedInUserRef, {
        whoFollowing: [...(loggedInUserData.whoFollowing || []), userToFollow],
        following: (loggedInUserData.following || 0) + 1,
      });
    }
  } catch (error) {
    console.error("Error following user: ", error);
  }
};

const fetchFollowingUsersTweets = async () => {
  //Get logged user's id
  const loggedInUserId = auth.currentUser.uid;

  //Get the list of the users that logged user is following
  const db = getFirestore();
  const loggedInUserRef = doc(db, "users", loggedInUserId);
  const loggedInUserSnapshot = await getDoc(loggedInUserRef);

  if (!loggedInUserSnapshot.exists()) {
    console.error("User not found.");
    return [];
  }

  const loggedInUserData = loggedInUserSnapshot.data();

  //Check if the user is following someone
  if (
    !loggedInUserData.whoFollowing ||
    loggedInUserData.whoFollowing.length === 0
  ) {
    return [];
  }

  try {
    //get the list of ids
    const followingUsersIds = loggedInUserData.whoFollowing.map(
      (user) => user.id
    );

    //Get the snapshot of each user that the id is inside followingUsersIds
    const querySnapshot = await getDocs(
      query(
        collection(db, "usertweets"),
        where("__name__", "in", followingUsersIds)
      )
    );

    const tweetsArray = [];

    //Iterate over the snapshots and for each one the tweets data get extract and pushed inside the tweetsArray
    querySnapshot.forEach((doc) => {
      const userTweetsData = doc.data();
      tweetsArray.push(...userTweetsData.tweets);
    });

    //Reorder the tweets with the most recent one on the top
    tweetsArray.sort((a, b) => {
      if (a.date === b.date) {
        return b.timestamp.localeCompare(a.timestamp);
      } else {
        return b.date.localeCompare(a.date);
      }
    });

    let newTweetArray = [];

    tweetsArray.forEach((tweet) => {
      if (
        tweet.retweeted ||
        tweet.rtId !== loggedInUserId ||
        tweet.userId !== loggedInUserId
      ) {
        newTweetArray.push(tweet);
      }
    });

    return newTweetArray;
  } catch (error) {
    console.error("Error fetching following users' tweets:", error);
    return [];
  }
};

const exploreTweets = async (exploreData) => {
  if (exploreData === null) {
    try {
      const db = getFirestore();

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
    return;
  }

  // Ottieni i dati del tweet dal documento
  const userData = tweetDoc.data();
  const tweetData = userData.tweets;
  const tweetIndex = tweetData.findIndex((tweet) => tweet.key === tweetId);

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
      const tweet = tweetData.find((tweet) => tweet.key === tweetId);

      if (tweet) {
        targetedTweet = tweet;
        documentId = doc.id;
        arrayTweet.push(...tweetData);
      }
    });

    const tweetIndex = arrayTweet.findIndex((tweet) => tweet.key === tweetId);

    let arrayToModify = arrayTweet;
    const isLiked = targetedTweet.likedBy.includes(loggedUser);
    const recipientUserDocRef = doc(db, "usertweets", documentId);

    if (isLiked) {
      const updatedLikedBy = targetedTweet.likedBy.filter(
        (id) => id !== loggedUser
      );

      const tweetsBefore = tweetData.slice(0, tweetIndex);
      const tweetsAfter = tweetData.slice(tweetIndex + 1);
      const updatedLikes = targetedTweet.likes - 1;

      const updatedTweets = [
        ...tweetsBefore,
        {
          ...targetedTweet,
          likedBy: updatedLikedBy,
          likes: updatedLikes,
          isActive: false,
        },
        ...tweetsAfter,
      ];

      // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
      await updateDoc(recipientUserDocRef, { tweets: updatedTweets });
    } else {
      const updatedLikedBy = [...targetedTweet.likedBy, loggedUser];
      const tweetsBefore = arrayToModify.slice(0, tweetIndex);
      const tweetsAfter = arrayToModify.slice(tweetIndex + 1);
      const updatedLikes = targetedTweet.likes + 1;

      const updatedTweets = [
        ...tweetsBefore,
        {
          ...targetedTweet,
          likedBy: updatedLikedBy,
          likes: updatedLikes,
          isActive: true,
        },
        ...tweetsAfter,
      ];

      // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
      await updateDoc(recipientUserDocRef, { tweets: updatedTweets });
    }
  }

  const tweet = tweetData[tweetIndex];
  const isLiked = tweet.likedBy.includes(loggedUser);

  // Aggiungi o rimuovi l'userId dall'array likedby
  if (isLiked) {
    const updatedLikedBy = tweet.likedBy.filter((id) => id !== loggedUser);
    const tweetsBefore = tweetData.slice(0, tweetIndex);
    const tweetsAfter = tweetData.slice(tweetIndex + 1);
    const updatedLikes = tweet.likes - 1;

    // Unire gli oggetti tweet precedenti, l'oggetto tweet modificato e gli oggetti tweet successivi
    const updatedTweets = [
      ...tweetsBefore,
      {
        ...tweet,
        likedBy: updatedLikedBy,
        likes: updatedLikes,
        isActive: false,
      },
      ...tweetsAfter,
    ];

    // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
    await updateDoc(userDocRef, { tweets: updatedTweets });
  } else {
    const updatedLikedBy = [...tweet.likedBy, loggedUser];

    // Creare una copia degli oggetti tweet precedenti l'oggetto specifico
    const tweetsBefore = tweetData.slice(0, tweetIndex);

    // Creare una copia degli oggetti tweet che si trovano dopo l'oggetto specifico
    const tweetsAfter = tweetData.slice(tweetIndex + 1);

    // Aggiornare il parametro likes nell'oggetto tweet corrispondente
    const updatedLikes = tweet.likes + 1;

    // Unire gli oggetti tweet precedenti, l'oggetto tweet modificato con il valore likes aggiornato e gli oggetti tweet successivi
    const updatedTweets = [
      ...tweetsBefore,
      {
        ...tweet,
        likedBy: updatedLikedBy,
        likes: updatedLikes,
        isActive: true,
      },
      ...tweetsAfter,
    ];

    addNotification(userId, "like", tweetId);

    // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
    await updateDoc(userDocRef, { tweets: updatedTweets });
  }
};

//Da aggiungere il blocco al rt di ogni tuo post o gestire l'eliminazione del rt ad il tuo post
const toggleRt = async (tweetId, userId) => {
  const db = getFirestore();
  const userDocRef = doc(db, "usertweets", userId);
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
        console.log("non puoi retwittare un tuo rt");
        foundOwnRt = true;
      }
    }
  });

  if (foundOwnRt || uniqueTweet.deleted) {
    return; // Esce completamente dalla funzione
  }

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
    return;
  }

  // Ottieni i dati del tweet dal documento
  const userData = tweetDoc.data();
  const tweetData = userData.tweets;
  const tweetIndex = tweetData.findIndex((tweet) => tweet.key === tweetId);

  if (tweetIndex === -1) {
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
          documentIdTwo = doc.id;
          arrayTweetTwo.push(...tweetData);
          retweetIndexTwo = arrayTweetTwo.indexOf(targetedTweetTwo);
        }
      });

      const recipientUserDocRefTwo = doc(db, "usertweets", documentIdTwo);

      //logica per rimuovere
      const updatedRtByTwo = targetedTweetTwo.rtBy.filter(
        (id) => id !== loggedUser
      );
      const tweetsBeforeTwo = arrayTweetTwo.slice(0, retweetIndexTwo);
      const tweetsAfterTwo = arrayTweetTwo.slice(retweetIndexTwo + 1);

      const updatedRtTwo = targetedTweetTwo.rt - 1;

      // Unire gli oggetti tweet precedenti, l'oggetto tweet modificato e gli oggetti tweet successivi
      const updatedTweets = [
        ...tweetsBeforeTwo,
        {
          ...targetedTweetTwo,
          rtBy: updatedRtByTwo,
          rt: updatedRtTwo,
        },
        ...tweetsAfterTwo,
      ];

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
            comments: [],
            rt: 0,
            rtName: loggedUserName,
            rtId: loggedUser,
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
      { ...tweet, rtBy: updatedRtBy, rt: updatedRt, youRetweeted: false },
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
      { ...tweet, rtBy: updatedRtBy, rt: updatedRt, youRetweeted: true },
      ...tweetsAfter,
    ];

    // Aggiorna il documento dell'utente con il nuovo array tweets aggiornato
    await updateDoc(userDocRef, { tweets: updatedTweets });

    // Aggiungi anche il tweet a retweetData per il documento dell'utente che retwitta
    const tweetKey = uuidv4(); // Genera una chiave unica

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
          comments: [],
          rt: 0,
          rtName: loggedUserName,
          rtId: loggedUser,
          originalId: tweet.key,
        },
      ],
    };

    addNotification(userId, "retweet", tweetId);

    await updateDoc(userTweetsRef, updatedRetweetData);
  }
};

//function to remove tweets
const removeTweet = async (tweetId, userId) => {
  // Ottieni il riferimento al documento del tweet corrispondente

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
  const userID = auth.currentUser.uid;

  const db = getFirestore();
  const userDocRef = doc(db, "users", userID);

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

  await updateDoc(userDocRef, updatedUserData);
};

const addComment = async (tweet, newTweet) => {
  const db = getFirestore();

  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, "users", userId);
  const tweetDoc = await getDoc(userDocRef);
  const userData = tweetDoc.data();
  const tweetDataName = userData.name;

  const commentKey = doc(collection(db, "usertweets", userId, "tweets")).id; // Genera una chiave unica

  // Ottiene tutti i dati per data e tempo
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

  if (tweet.retweeted) {
    const userCollectionRef = collection(db, "usertweets");
    const usersQuerySnapshot = await getDocs(userCollectionRef);
    let userDocIdFound = null;
    const updatePromises = [];

    usersQuerySnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const tweetData = userData.tweets;
      const selectedTweetIndex = tweetData.findIndex(
        (tweetItem) => tweetItem.key === tweet.key
      );

      if (selectedTweetIndex !== -1) {
        const selectedTweet = tweetData[selectedTweetIndex];

        // Update selectedTweet.comments with push
        selectedTweet.comments.push({
          content: newTweet,
          userId: userId,
          name: tweetDataName,
          date: date,
          timestamp: time,
          key: commentKey,
        });

        // Replace the old selectedTweet with the updated one
        tweetData[selectedTweetIndex] = selectedTweet;

        userDocIdFound = userDoc.id;

        // Add the promise for updating the user's document to the array
        updatePromises.push(
          updateDoc(doc(db, "usertweets", userDoc.id), { tweets: tweetData })
        );
      } else {
        /////
      }
      addNotification(tweet.userId, "comment", tweet.key);
    });
  } else {
    const userDocRef = doc(db, "usertweets", tweet.userId);
    const tweetDoc = await getDoc(userDocRef);
    const userData = tweetDoc.data();
    const tweetData = userData.tweets;

    const userNameDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userNameDocRef);
    const userInfo = userDoc.data();

    tweetData.forEach((tweetItem) => {
      if (tweetItem.key === tweet.key) {
        tweetItem.comments.push({
          content: newTweet,
          userId: userId,
          name: userInfo.name,
          date: date,
          timestamp: time,
          key: commentKey,
        });
      }
    });
    addNotification(tweet.userId, "comment", tweet.key);
    await updateDoc(userDocRef, { tweets: tweetData });
  }
};

const fetchComments = async (onAllTweet) => {
  const db = getFirestore();
  const comments = [];

  if (onAllTweet.retweeted) {
    // If it's a retweet, find the original tweet across all user tweets
    const usersCollection = collection(db, "usertweets");
    const usersQuerySnapshot = await getDocs(usersCollection);

    for (const userDoc of usersQuerySnapshot.docs) {
      const userData = userDoc.data();
      const tweetData = userData.tweets;
      const selectedTweet = tweetData.find(
        (tweet) => tweet.key === onAllTweet.key
      );

      if (selectedTweet) {
        return Object.values(selectedTweet.comments);
      }
    }

    // If the retweeted original tweet is not found, return an empty array
    return [];
  } else {
    // If it's an original tweet, fetch comments as before
    const userDocRef = doc(db, "usertweets", onAllTweet.userId);
    const tweetDoc = await getDoc(userDocRef);
    const userData = tweetDoc.data();
    const tweetData = userData.tweets;
    const selectedTweet = tweetData.find(
      (tweet) => tweet.key === onAllTweet.key
    );

    if (selectedTweet) {
      return Object.values(selectedTweet.comments);
    } else {
      return [];
    }
  }
};

const removeComment = async (comment, onAllTweet) => {
  const commentKey = comment.key;
  const foundCollection = onAllTweet.userId;

  const db = getFirestore();
  const userDocRef = doc(db, "usertweets", foundCollection);
  const tweetDoc = await getDoc(userDocRef);
  const userData = tweetDoc.data();
  const tweetData = userData.tweets;

  const updatedTweetData = tweetData.map((tweet) => {
    if (tweet.comments) {
      const commentIndex = tweet.comments.findIndex(
        (c) => c.key === commentKey
      );
      if (commentIndex !== -1) {
        tweet.comments.splice(commentIndex, 1); // Rimuovi il commento dall'array
      }
    }
    return tweet;
  });

  // Aggiorna il documento nel database con il nuovo array di commenti
  await updateDoc(userDocRef, { tweets: updatedTweetData });
};

const createNotifyCollection = async () => {
  const db = getFirestore();
  const userId = auth.currentUser.uid;
  const userDocRef = doc(db, "notifications", userId);
  const userDocSnapshot = await getDoc(userDocRef);

  if (userDocSnapshot.exists()) {
    return; // Non fare nulla, poiché il documento esiste già
  } else {
    await setDoc(userDocRef, {}); // Crea un nuovo documento vuoto con l'ID dell'utente
  }
};

const addNotification = async (recipientId, type, postId) => {
  const userId = auth.currentUser.uid;
  const uniqueKey = uuidv4();

  try {
    const userNotificationDocRef = doc(db, "notifications", recipientId);

    // Ottieni il documento delle notifiche dell'utente destinatario
    const userNotificationDocSnapshot = await getDoc(userNotificationDocRef);

    if (userNotificationDocSnapshot.exists()) {
      // Il documento esiste, quindi aggiungi la nuova notifica
      const userTweetDocRef = doc(db, "usertweets", recipientId);
      const userTweetDocSnapshot = await getDoc(userTweetDocRef);
      const cyclethis = userTweetDocSnapshot.data();
      const tweetsArray = cyclethis.tweets;
      let postWithMatchingKey = null;

      if (tweetsArray) {
        postWithMatchingKey = tweetsArray.find((tweet) => tweet.key === postId);
      }

      const userTweetDocRefTwo = doc(db, "users", userId);
      const userTweetDocSnapshotTwo = await getDoc(userTweetDocRefTwo);
      const cyclethisTwo = userTweetDocSnapshotTwo.data();
      const senderName = cyclethisTwo.name;

      let newNotification; // Define newNotification here

      if (type === "follower") {
        newNotification = {
          senderId: userId,
          senderName: senderName,
          type: type,
          timestamp: new Date(),
          read: false,
          uniqueKey: uniqueKey,
        };

        const existingData = userNotificationDocSnapshot.data();
        const notificationsArray = existingData.notifications || [];

        notificationsArray.push(newNotification);

        // Aggiorna il documento con l'array delle notifiche aggiornato
        await updateDoc(userNotificationDocRef, {
          notifications: notificationsArray,
        });
      } else {
        newNotification = {
          senderId: userId,
          senderName: senderName,
          type: type,
          postID: postId,
          timestamp: new Date(),
          read: false,
          post: postWithMatchingKey,
          uniqueKey: uniqueKey,
        };

        const existingData = userNotificationDocSnapshot.data();
        const notificationsArray = existingData.notifications || [];

        notificationsArray.push(newNotification);

        // Aggiorna il documento con l'array delle notifiche aggiornato
        await updateDoc(userNotificationDocRef, {
          notifications: notificationsArray,
        });
      }
    }
  } catch (error) {
    console.error("Errore durante l'aggiunta della notifica:", error);
  }
};

//fetch notifications

const fetchNotifications = async () => {
  const userId = auth.currentUser.uid;
  const userNotificationDocRef = doc(db, "notifications", userId);
  const tweetDoc = await getDoc(userNotificationDocRef);
  const userData = tweetDoc.data();
  const tweetData = userData.notifications;

  if (tweetData === undefined || tweetData === null) {
    return 0;
  }

  // Filtra le notifiche escludendo quelle con lo stesso mittente dell'utente loggato
  const filteredNotifications = tweetData.filter(
    (notification) => notification.sender !== userId
  );

  return filteredNotifications;
};

const removeNotification = async (notificationKey) => {
  const userId = auth.currentUser.uid;

  try {
    const userNotificationsDocRef = doc(db, "notifications", userId);
    const userNotificationsDocSnapshot = await getDoc(userNotificationsDocRef);
    const userData = userNotificationsDocSnapshot.data();

    if (!userData || !userData.notifications) {
      return;
    }

    // Find the index of the notification to be removed
    const notificationIndex = userData.notifications.findIndex(
      (notify) => notify.uniqueKey === notificationKey
    );

    if (notificationIndex !== -1) {
      // Remove the notification from the array
      userData.notifications.splice(notificationIndex, 1);

      // Update the Firestore document with the updated notifications array
      await updateDoc(userNotificationsDocRef, {
        notifications: userData.notifications,
      });
    } else {
    }
  } catch (error) {
    console.error("Error removing the notification", error);
  }
};

// Function to set the background color in Firestore
const setBackgroundColor = async (color) => {
  const userId = auth.currentUser.uid;

  try {
    const backgroundColorDocRef = doc(db, "backgroundColors", userId);

    // Check if the document exists in Firestore
    const docSnapshot = await getDoc(backgroundColorDocRef);

    if (docSnapshot.exists()) {
      // If the document exists, update its color
      await setDoc(backgroundColorDocRef, { color });
    } else {
      // If the document does not exist, create it with the given userId as the document name
      await setDoc(backgroundColorDocRef, { color });
    }
  } catch (error) {
    console.error("Error setting background color:", error);
  }
};

// Function to get the background color for a specific user
const getBackgroundColor = async (userId) => {
  try {
    // Reference the background color document for the user
    const backgroundColorDocRef = doc(db, "backgroundColors", userId);

    // Fetch the document data
    const docSnap = await getDoc(backgroundColorDocRef);

    // Check if the document exists and has data
    if (docSnap.exists()) {
      const backgroundColorData = docSnap.data();
      const bgcReturn = backgroundColorData.color || "";
      return bgcReturn; // Return the background color if it exists
    } else {
      // If the document doesn't exist, return an empty string or a default color
      return "";
    }
  } catch (error) {
    console.error("Error getting background color:", error);
    throw error;
  }
};

// Function to set the background color in Firestore
const setImageProfile = async (imageUrl) => {
  const userId = auth.currentUser.uid;

  try {
    const profileImageDocRef = doc(db, "profileImage", userId);

    // Check if the document exists in Firestore
    const docSnapshot = await getDoc(profileImageDocRef);

    if (docSnapshot.exists()) {
      // If the document exists, update its color
      await setDoc(profileImageDocRef, { imageUrl });
    } else {
      // If the document does not exist, create it with the given userId as the document name
      await setDoc(profileImageDocRef, { imageUrl });
    }
  } catch (error) {
    console.error("Error setting background color:", error);
  }
};

const getImageProfile = async (userId) => {
  try {
    // Reference the background color document for the user
    const getImageProfileDocRef = doc(db, "profileImage", userId);

    // Fetch the document data
    const docSnap = await getDoc(getImageProfileDocRef);

    // Check if the document exists and has data
    if (docSnap.exists()) {
      const imageProfileData = docSnap.data();
      const ipdReturn = imageProfileData.imageUrl || "";
      return ipdReturn; // Return the background color if it exists
    } else {
      // If the document doesn't exist, return an empty string or a default color
      return "";
    }
  } catch (error) {
    console.error("Error getting image url:", error);
    throw error;
  }
};

const uploadProfileImage = async (userId, imageFile) => {
  let uniqueName = imageFile.name + uuidv4();
  const storageRef = ref(storage, `profileImages/${userId}/${uniqueName}`);

  try {
    // Upload the image file to Firebase Storage
    await uploadBytes(storageRef, imageFile);

    // Get the download URL of the uploaded image
    const imageUrl = await getDownloadURL(storageRef);
    await setImageProfile(imageUrl);

    return imageUrl; // Return the download URL
  } catch (error) {
    console.error("Error uploading image file:", error);
    throw error;
  }
};

async function whoFollowing(userId) {
  try {
    // Verifica se l'utente è autenticato
    const loggedUser = auth.currentUser.uid;

    if (loggedUser) {
      const docName = doc(db, "users", loggedUser);
      const docSnapshot = await getDoc(docName);

      if (docSnapshot.exists) {
        const whoFollowing = docSnapshot.data().whoFollowing;
        let isUserFollowing = false;

        whoFollowing.some((item, index) => {
          if (item.id === userId) {
            isUserFollowing = true;
            return true; // Termina la ricerca, abbiamo trovato una corrispondenza
          }
        });

        if (isUserFollowing === true) {
          return true;
        } else {
          return false;
        }
      }
    }
  } catch (error) {
    console.error("Errore durante la verifica dell'utente:", error);
    return;
  }
}

async function navbarLogIn() {
  try {
    const loggedUser = auth.currentUser.uid;

    const docRef = doc(db, "notifications", loggedUser);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists) {
      await setDoc(docRef, { notifications: [] });
    }
  } catch (error) {
    console.error("Errore durante l'aggiunta dell'array di notifiche:", error);
  }
}

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
  addComment,
  fetchComments,
  removeComment,
  createNotifyCollection,
  addNotification,
  fetchNotifications,
  removeNotification,
  setBackgroundColor,
  getBackgroundColor,
  uploadProfileImage,
  getImageProfile,
  whoFollowing,
  navbarLogIn,
  storage,
  auth,
};
