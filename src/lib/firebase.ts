// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD4VzdbQox3aNVtzb1Y3Oh3b85oeZTRwAM",
    authDomain: "virtual-lab-5d05f.firebaseapp.com",
    projectId: "virtual-lab-5d05f",
    storageBucket: "virtual-lab-5d05f.firebasestorage.app",
    messagingSenderId: "741567876082",
    appId: "1:741567876082:web:074d9cc2d7152c7f2cb96b",
    measurementId: "G-QQ5FPRVQD4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Force select account on login
googleProvider.setCustomParameters({
    prompt: 'select_account'
});