// beam-interactive-dashboard-firebase-config.js
// This file initializes Firebase and provides global access to Firebase services.

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// NOTE: When deploying to your own Firebase project, replace these values
// with the actual configuration from your Firebase Console.
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY", // This is a placeholder. Replace with your actual Firebase API Key.
  authDomain: "beam-wellbeing-app.firebaseapp.com",
  projectId: "beam-wellbeing-app",
  storageBucket: "beam-wellbeing-app.firebasestorage.app",
  messagingSenderId: "170220527849",
  appId: "1:170220527849:web:8d98d95530912bb78fd078",
  measurementId: "G-D84GH729CS"
};

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, signInWithCustomToken, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, FieldValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Initialize Firebase App
// This 'app' instance will be used by other Firebase services.
const app = initializeApp(firebaseConfig);

// Get Firebase Authentication and Firestore instances
// These are made globally available for easier access in main.js
window.db = getFirestore(app);
window.auth = getAuth(app);
window.isAuthReady = false; // Flag to indicate Firebase Auth is initialized and ready
window.isAuthenticated = false; // Flag to indicate user is authenticated (not anonymous)
window.currentUserId = null; // Store current user ID
window.currentUserName = null; // Store current user's display name

// Expose FieldValue globally for Firestore operations like increment/arrayUnion/arrayRemove
window.firestore = {
    FieldValue: FieldValue
};

// Initialize Firebase Auth and get current user
// This ensures Firestore listeners and other auth-dependent logic run only after auth is ready.
window.auth.onAuthStateChanged(async (user) => {
    if (user) {
        window.currentUserId = user.uid;
        // Try to load username from localStorage first
        let storedUserName = localStorage.getItem(`beam_username_${user.uid}`);
        if (storedUserName) {
            window.currentUserName = storedUserName;
        } else if (user.displayName) {
            // Fallback to Firebase displayName if available
            window.currentUserName = user.displayName;
            localStorage.setItem(`beam_username_${user.uid}`, user.displayName); // Store it for future
        } else {
            // If no display name, generate a default one or prompt user
            window.currentUserName = `User ${user.uid.substring(0, 4)}`; // Shorten for display
            localStorage.setItem(`beam_username_${user.uid}`, window.currentUserName);
        }

        if (!user.isAnonymous) {
            window.isAuthenticated = true;
        } else {
            window.isAuthenticated = false;
        }
    } else {
        // No user is signed in, sign in anonymously for access to public data
        try {
            await signInAnonymously(window.auth);
            // After anonymous sign-in, onAuthStateChanged will fire again with the anonymous user
        } catch (error) {
            console.error("Error signing in anonymously:", error);
            // Handle this error appropriately, perhaps disable some features
        }
        window.isAuthenticated = false;
        window.currentUserId = null;
        window.currentUserName = null;
    }
    window.isAuthReady = true;
    // Dispatch a custom event to notify other parts of the app that Firebase Auth is ready
    document.dispatchEvent(new CustomEvent('firebaseAuthReady'));
});

// The __app_id is a special variable provided by the Canvas environment.
// For deployment outside Canvas, you would typically hardcode your Firebase projectId here,
// or manage it via environment variables.
window.__app_id = firebaseConfig.projectId; // Use the projectId from your config
