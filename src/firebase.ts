import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAgxT_kUs27Re-auJw9BlT1egfuu7k0wD8",
  authDomain: "pgi-irpc.firebaseapp.com",
  databaseURL: "https://pgi-irpc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pgi-irpc",
  storageBucket: "pgi-irpc.firebasestorage.app",
  messagingSenderId: "1069107893671",
  appId: "1:1069107893671:web:2c1b0cf55d413f4606d282",
  measurementId: "G-E1HR79Y0VD"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-isabelariceapp-7cad345c-53a5-4a06-bef9-9e4e562dc0ed");
