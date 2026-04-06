import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCb5KnHL9HAqpp88SZCUCotcxK7BJQDypE",
  authDomain: "login-529b5.firebaseapp.com",
  projectId: "login-529b5",
  storageBucket: "login-529b5.firebasestorage.app",
  messagingSenderId: "149527601374",
  appId: "1:149527601374:web:0f4e86aebd5cceb8eda24f",
  measurementId: "G-FJRREL0HXV"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
