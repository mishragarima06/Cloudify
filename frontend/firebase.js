// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDsPuH0pWqeqc5yuAncn8Q4htAsYv5pv1o",
    authDomain: "cloudify-17ff6.firebaseapp.com",
    projectId: "cloudify-17ff6",
    storageBucket: "cloudify-17ff6.firebasestorage.app",
    messagingSenderId: "728322328893",
    appId: "1:728322328893:web:29b42a3864b8a78a775d54",
    measurementId: "G-8PHDM6T2F4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;