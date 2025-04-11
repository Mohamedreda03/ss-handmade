// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: "lms-1-be4ed.firebaseapp.com",
  projectId: "lms-1-be4ed",
  storageBucket: "lms-1-be4ed.appspot.com",
  messagingSenderId: "1039697367160",
  appId: "1:1039697367160:web:f754b5f4ca2e530da59d8d",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
