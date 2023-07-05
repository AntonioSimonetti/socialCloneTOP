import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
//import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAI4l6DitMPPr-6lnlqjQNipldQUVntUWE",
  authDomain: "socialc-34645.firebaseapp.com",
  projectId: "socialc-34645",
  storageBucket: "socialc-34645.appspot.com",
  messagingSenderId: "951089738551",
  appId: "1:951089738551:web:4acee256083ac55a3220b2",
  measurementId: "G-V015E9BCHW",
};

// Initialize Firebase
// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funzione di log
const logCollection = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "test"));
    querySnapshot.forEach((doc) => {
      console.log("Document ID: ", doc.id);
      console.log("Document data: ", doc.data());
    });
  } catch (error) {
    console.error("Error fetching documents: ", error);
  }
};

export { app, db, logCollection };
