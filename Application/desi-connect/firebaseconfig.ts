// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPNfGyown0prWqTcKkqGa3c3q5lYOa2no",
  authDomain: "desi-connect-app.firebaseapp.com",
  projectId: "desi-connect-app",
  storageBucket: "desi-connect-app.appspot.com",
  messagingSenderId: "1061001522905",
  appId: "1:1061001522905:ios:9d8e8e6c29a0aeb9ff6827",
  measurementId: "G-WR4HDMDQ1C",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
