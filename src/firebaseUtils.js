import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
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

const createUserDocument = async (user) => {
  const usersCollectionRef = doc(db, "users", user.uid);

  const { name, email, position, age, photoURL } = user; // Destructuring della proprietà photoURL

  const userData = {
    name,
    email,
    position,
    age,
    photoURL, // Utilizza la proprietà photoURL fornita nell'oggetto user
    gender: null,
    bio: null,
    avatar: null,
    interest: null,
    following: 0,
    followers: 0,
  };
  await setDoc(usersCollectionRef, userData);

  // Log, to be removed
  const createdUserSnapshot = await getDoc(usersCollectionRef);
  const createdUserData = createdUserSnapshot.data();
  console.log("New user created:", createdUserData);

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
    // Resto del codice da eseguire dopo aver salvato l'utente nel database
  } catch (error) {
    console.log("Errore durante l'accesso con Google:", error);
  }
};

export {
  createUserDocument,
  fetchUserProfileData,
  signInWithGoogleAndCreateUser,
};
