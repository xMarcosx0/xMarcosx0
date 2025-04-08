// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8TAzQfBcmj1-oGHVxAkkTvU7bhXYlHb8",
  authDomain: "aire-forms.firebaseapp.com",
  projectId: "aire-forms",
  storageBucket: "aire-forms.firebasestorage.app",
  messagingSenderId: "1079936438546",
  appId: "1:1079936438546:web:f31b39b0441f141a24a3cb",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app)

