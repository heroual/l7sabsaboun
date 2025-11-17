import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { FinanceState, ChatMessage, UserData } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAaWv-LjnDKalt6psj0XKgS6OE6hQVwA0A",
  authDomain: "le7sabsaboun.firebaseapp.com",
  projectId: "le7sabsaboun",
  storageBucket: "le7sabsaboun.firebasestorage.app",
  messagingSenderId: "813780535296",
  appId: "1:813780535296:web:34fc821ca2b2ca070cb0e5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const defaultInitialState: FinanceState = {
  incomeSources: [],
  expenses: [],
  goal: null,
};

const defaultChatHistory: ChatMessage[] = [
    { type: 'agent', text: 'أهلاً! أنا لحساب صابون. كيفاش نقدر نعاونك اليوم؟' },
];


export const getOrCreateUserDocument = async (userAuth: User): Promise<UserData | null> => {
    if (!userAuth) return null;
    const userDocRef = doc(db, 'users', userAuth.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
        const createdAt = new Date();
        const newUserdata: UserData = {
            createdAt,
            financeState: defaultInitialState,
            chatHistory: defaultChatHistory,
        };
        try {
            await setDoc(userDocRef, newUserdata);
            return newUserdata;
        } catch (error) {
            console.error("Error creating user document:", error);
            return null;
        }
    }
    return userSnapshot.data() as UserData;
};


export const updateUserData = async (uid: string, data: { financeState: FinanceState, chatHistory: ChatMessage[] }) => {
    const userDocRef = doc(db, 'users', uid);
    try {
        await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}


export const onAuthStateChangedListener = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);

export { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
};