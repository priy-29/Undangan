const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCJXzHrMGS5RQSCBmyq2kxauf-VGgpJ6as",
    authDomain: "undangan-a8284.firebaseapp.com",
    projectId: "undangan-a8284",
    storageBucket: "undangan-a8284.firebasestorage.app",
    messagingSenderId: "969570569733",
    appId: "1:969570569733:web:0ac01cf702fd553de2566c",
    measurementId: "G-6JM9BB1J8V"
};

/* Jangan ubah kode di bawah ini */
window.FIREBASE_CONFIG = FIREBASE_CONFIG;

window.FIREBASE_CONFIGURED =
    typeof FIREBASE_CONFIG.apiKey === "string" &&
    FIREBASE_CONFIG.apiKey.length > 10 &&
    !FIREBASE_CONFIG.apiKey.includes("PASTE_");