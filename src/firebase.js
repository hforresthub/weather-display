// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_KEY,//"AIzaSyAgsGo1dwey3e4F5DoTHZ0av-mKl0y-DBw", // will use process.env.REACT_APP_FIREBASE_KEY after testing
	authDomain: "weatherenews.firebaseapp.com",
	databaseURL: "https://weatherenews-default-rtdb.firebaseio.com",
	projectId: "weatherenews",
	storageBucket: "weatherenews.appspot.com",
	messagingSenderId: "263933813201",
	appId: "1:263933813201:web:e6a82ce882568b547300f0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const realtime = getDatabase(app);

export default realtime