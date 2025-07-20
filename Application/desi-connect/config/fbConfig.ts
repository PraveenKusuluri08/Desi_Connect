// firebase.ts or fbConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import * as firebaseAuth from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyBYjHg4IT9K6SAssLO0HDh2Ssvb-Hrwcwk",
  authDomain: "desi-connect-22a9c.firebaseapp.com",
  projectId: "desi-connect-22a9c",
  storageBucket: "desi-connect-22a9c.appspot.com",
  messagingSenderId: "603162378023",
  appId: "1:603162378023:web:20bacc14b11758e7243302",
  measurementId: "G-63NKZTE979"
};

const app = initializeApp(firebaseConfig);
const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;
const auth = firebaseAuth.initializeAuth(app, {
          persistence: reactNativePersistence(AsyncStorage),
        });

const db = getFirestore(app);

export { app, auth, db };
