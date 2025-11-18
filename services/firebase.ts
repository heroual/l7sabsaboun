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

const now = new Date();
const defaultInitialState: FinanceState = {
  incomeSources: [],
  expenses: [],
  goal: null,
  recurringBills: [],
  recurringIncomes: [],
  history: [],
  lastActiveMonth: now.getMonth(),
  lastActiveYear: now.getFullYear(),
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
    const userData = userSnapshot.data() as UserData;
    // Backwards compatibility for users
    if (!userData.financeState.recurringBills) {
        userData.financeState.recurringBills = [];
    }
    if (!userData.financeState.recurringIncomes) {
        userData.financeState.recurringIncomes = [];
    }
    if (!userData.financeState.history) {
        userData.financeState.history = [];
    }
    if (userData.financeState.lastActiveMonth === undefined || userData.financeState.lastActiveYear === undefined) {
        const rightNow = new Date();
        userData.financeState.lastActiveMonth = rightNow.getMonth();
        userData.financeState.lastActiveYear = rightNow.getFullYear();
    }
    return userData;
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