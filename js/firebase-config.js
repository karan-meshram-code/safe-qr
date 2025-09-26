// Firebase configuration
// Project credentials for Firebase services
const firebaseConfig = {
  apiKey: "AIzaSyDhYchNUg7P9Z5z_kOdJTVIBHEfv6kgHVw",
  authDomain: "resqr-c4a0a.firebaseapp.com",
  projectId: "resqr-c4a0a",
  storageBucket: "resqr-c4a0a.appspot.com",
  messagingSenderId: "414785117529",
  appId: "1:414785117529:web:5ef3ba4d2aa8b9977f0048",
  measurementId: "G-STELX8PPHW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to auth and firestore for easier access throughout the app
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline data persistence
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log('Persistence failed: Multiple tabs are open');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.log('Persistence is not available in this browser');
    }
  });

// Export Firebase configuration in case it's needed elsewhere
// This isn't necessary for this app, but it's a good practice
if (typeof module !== 'undefined') {
  module.exports = { firebaseConfig };
} 