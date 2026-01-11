// Firebase Configuration for S Reddit
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAckoGqPp1nBd_JSaHsExWAuLGdMl6NkQY",
    authDomain: "fir-reddit-4e419.firebaseapp.com",
    projectId: "fir-reddit-4e419",
    storageBucket: "fir-reddit-4e419.firebasestorage.app",
    messagingSenderId: "666516320138",
    appId: "1:666516320138:web:5d19ba7307cd5b3424a273",
    measurementId: "G-744K59Z20R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

export { app, analytics };
export default app;
