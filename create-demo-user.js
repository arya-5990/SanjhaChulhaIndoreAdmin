const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Sanjha Chulha Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDfBBVwKS9TaBjXQDhZ2Dpr_8w9ekQSvNQ",
    authDomain: "sanjhachulhaindore-f59e5.firebaseapp.com",
    projectId: "sanjhachulhaindore-f59e5",
    storageBucket: "sanjhachulhaindore-f59e5.firebasestorage.app",
    messagingSenderId: "88250749019",
    appId: "1:88250749019:android:262aaca4f7109c83aeef7e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Demo User Credentials
const email = "admin@sanjhachulha.com";
const password = "password123";

async function createDemoUser() {
    try {
        console.log(`Creating demo user...`);
        console.log(`Email: ${email}`);

        // Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        console.log("Success! Demo user created.");
        console.log(`User UID: ${userCredential.user.uid}`);
        console.log(`\nYou can now login with:\nEmail: ${email}\nPassword: ${password}`);

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log("\nUser already exists! You can login with:");
            console.log(`Email: ${email}`);
            console.log(`Password: ${password} (If this was the original password)`);
            console.log("If you forgot the password, you can reset it in the Firebase Console.");
        } else {
            console.error("Error creating user:", error.message);
        }
    }
}

createDemoUser();
