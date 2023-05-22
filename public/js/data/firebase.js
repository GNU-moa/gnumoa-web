// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-functions.js";

const response = await fetch("/gnu-moa-firebase-adminsdk.json");
const firebaseConfig = await response.json();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);
