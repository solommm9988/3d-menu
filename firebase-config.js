import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// إعدادات مشروعك المسجلة
const firebaseConfig = {
  apiKey: "AIzaSyDEU3ksUDW4jYgxHZdApYJij6oKhywKLIo",
  authDomain: "d-menu-31578.firebaseapp.com",
  databaseURL: "https://d-menu-31578-default-rtdb.firebaseio.com",
  projectId: "d-menu-31578",
  storageBucket: "d-menu-31578.firebasestorage.app",
  messagingSenderId: "797012778750",
  appId: "1:797012778750:web:5265fa2f6103efa3cd8faf",
  measurementId: "G-Y603ML76GR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);