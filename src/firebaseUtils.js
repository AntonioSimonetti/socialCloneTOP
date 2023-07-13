import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
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

  const tweetData = {
    content: tweetContent,
    timestamp: new Date().getTime(),
    likes: 0,
    rt: 0,
    comments: null,
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

export {
  createUserDocument,
  fetchUserProfileData,
  signInWithGoogleAndCreateUser,
  addTweet,
};
