import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0YyIcyaKkXRQPeI_yzWRNlqlFFX24al0",
  authDomain: "coffee-managements.firebaseapp.com",
  projectId: "coffee-managements",
  storageBucket: "coffee-managements.appspot.com",
  messagingSenderId: "752217173433",
  appId: "1:752217173433:web:d8967ed71deb6305a8da68",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { storage, auth, provider, signInWithPopup };
