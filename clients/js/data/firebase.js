// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-functions.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2IgfUYPhtaMPDf9KzylxIS8sma55nzak",
  authDomain: "gnu-moa.firebaseapp.com",
  projectId: "gnu-moa",
  storageBucket: "gnu-moa.appspot.com",
  messagingSenderId: "847390840165",
  appId: "1:847390840165:web:034e0524a15ff012807d8c",
  measurementId: "G-DVMHL25R2P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);