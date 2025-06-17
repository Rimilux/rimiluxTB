// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDfDcSfTM5IlevHpY83YxeZ_3KKrU5sSwo",
    authDomain: "rankseer-s5620.firebaseapp.com",
    projectId: "rankseer-s5620",
    storageBucket: "rankseer-s5620.firebasestorage.app",
    messagingSenderId: "206627882086",
    appId: "1:206627882086:web:82bfe394f48a53f6ea19a7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Admin credentials
const ADMIN_EMAIL = "superdanguwa786@gmail.com";
const ADMIN_PASSWORD = "50tseta7tarub";

// Export for use in other files
window.firebaseApp = {
    auth,
    db,
    ADMIN_EMAIL,
    ADMIN_PASSWORD
};

