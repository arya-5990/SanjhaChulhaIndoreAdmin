import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace with your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDfBBVwKS9TaBjXQDhZ2Dpr_8w9ekQSvNQ",
    authDomain: "sanjhachulhaindore-f59e5.firebaseapp.com",
    projectId: "sanjhachulhaindore-f59e5",
    storageBucket: "sanjhachulhaindore-f59e5.firebasestorage.app",
    messagingSenderId: "88250749019",
    appId: "1:88250749019:android:262aaca4f7109c83aeef7e",
    // measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
