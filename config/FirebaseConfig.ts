import { initializeApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCHe8LPd_LAqCswt7HRx3vKtwc-BF_3A_M",
  authDomain: "expensetracker-92b8b.firebaseapp.com",
  projectId: "expensetracker-92b8b",
  storageBucket: "expensetracker-92b8b.firebasestorage.app",
  messagingSenderId: "98994504870",
  appId: "1:98994504870:web:fe5439070ad346f2d96767",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);



