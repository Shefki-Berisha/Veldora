// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, addDoc, collection } from "firebase/firestore/lite";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDlBe1p7t1xsBins36Ny_1FvObUcIoBa8",
  authDomain: "veldora-59ce7.firebaseapp.com",
  projectId: "veldora-59ce7",
  storageBucket: "veldora-59ce7.appspot.com",
  messagingSenderId: "312391266505",
  appId: "1:312391266505:web:150f9cf3d5f7c007265d18",
  measurementId: "G-281ZHP3CB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export async function createTicket(threadId: string, text: string) {
    try {
        await addDoc(collection(db, "tickets"), {
            threadId,
            text,
            OpenedAt: Date()
        });
    } catch (error) {
        console.error('Error creating adding document: ', error);
    }
}