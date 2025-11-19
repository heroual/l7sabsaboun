
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

import { FinanceState, ChatMessage, UserData, IncomeSource, Expense, ExpenseCategory, RecurringBill, RecurrenceType, RecurringIncome, MonthlyRecord } from '../types';

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

// Helper to convert Firestore Timestamps (or other date formats) to a consistent ISO string
const ensureISOString = (date: any): string => {
    try {
        if (date && typeof date.toDate === 'function') {
            return date.toDate().toISOString();
        }
        if (typeof date === 'string' && !isNaN(Date.parse(date))) {
            return date;
        }
        if (date instanceof Date) {
            return date.toISOString();
        }
    } catch (e) {
        console.warn("Date conversion failed", e);
    }
    return new Date().toISOString();
};

const sanitizeOptionalNumber = (value: any): number | undefined => {
    if (value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
};

// STRICT SANITIZATION TO PREVENT REACT ERROR #310
// This function ensures that ONLY strings are returned. Objects, Arrays, and nulls become the fallback.
const safeString = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return String(val);
    // If it's an object, array, or symbol, return fallback.
    // This specifically prevents { key: 'value' } from being rendered as a child in React.
    return fallback;
};

// Remove undefined values recursively for Firestore
const removeUndefined = (obj: any): any => {
    if (obj === null) return null;
    if (obj === undefined) return null;
    if (obj instanceof Date) return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(removeUndefined);
    }
    
    if (typeof obj === 'object') {
        const newObj: any = {};
        Object.keys(obj).forEach(key => {
            const val = obj[key];
            if (val !== undefined) {
                newObj[key] = removeUndefined(val);
            }
        });
        return newObj;
    }
    
    return obj;
};

const generateId = () => {
    // Safe UUID generation that works in all environments
    try {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
    } catch (e) {
        // Fallback if crypto is restricted
    }
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const sanitizeChatHistory = (history: any): ChatMessage[] => {
    if (!Array.isArray(history)) return defaultChatHistory;
    const sanitized = history
        .map(msg => {
            if (!msg || typeof msg !== 'object') return null;
            const type = msg.type;
            // Explicitly sanitize text using safeString which rejects objects
            const text = safeString(msg.text, '');
            
            if ((type === 'user' || type === 'agent') && text) {
                return { type, text };
            }
            return null;
        })
        .filter((msg): msg is ChatMessage => msg !== null);
    return sanitized.length > 0 ? sanitized : defaultChatHistory;
};

const sanitizeIncomes = (items: any): IncomeSource[] => {
    if (!Array.isArray(items)) return [];
    return items
        .map(item => {
            if (!item || typeof item !== 'object') return null;
            return {
                id: safeString(item.id, generateId()),
                name: safeString(item.name, 'مدخول بدون اسم'),
                amount: Number(item.amount) || 0,
                date: ensureISOString(item.date),
            };
        })
        .filter((item): item is IncomeSource => item !== null);
};

const sanitizeExpenses = (items: any): Expense[] => {
    if (!Array.isArray(items)) return [];
    return items
        .map(item => {
            if (!item || typeof item !== 'object') return null;
            // Validate category against new Enum. If invalid (e.g. old category), default to OTHER ('اخرى')
            let category: ExpenseCategory = ExpenseCategory.OTHER;
            if (typeof item.category === 'string' && Object.values(ExpenseCategory).includes(item.category as ExpenseCategory)) {
                category = item.category as ExpenseCategory;
            }
            
            return {
                id: safeString(item.id, generateId()),
                name: safeString(item.name, 'مصروف بدون اسم'),
                amount: Number(item.amount) || 0,
                date: ensureISOString(item.date),
                category: category,
            };
        })
        .filter((item): item is Expense => item !== null);
};

const sanitizeRecurringIncomes = (items: any): RecurringIncome[] => {
    if (!Array.isArray(items)) return [];
    return items
        .map(item => {
            if (!item || typeof item !== 'object') return null;
            let recurrenceType: RecurrenceType = RecurrenceType.MONTHLY;
            if (typeof item.recurrenceType === 'string' && Object.values(RecurrenceType).includes(item.recurrenceType)) {
                recurrenceType = item.recurrenceType;
            }
            const saneItem: RecurringIncome = {
                id: safeString(item.id, generateId()),
                name: safeString(item.name, 'مدخول ثابت بدون اسم'),
                amount: Number(item.amount) || 0,
                recurrenceType: recurrenceType,
                dayOfMonth: sanitizeOptionalNumber(item.dayOfMonth),
                month: sanitizeOptionalNumber(item.month),
                day: sanitizeOptionalNumber(item.day),
            };
            if (item.lastAddedDate) {
                saneItem.lastAddedDate = ensureISOString(item.lastAddedDate);
            }
            return saneItem;
        })
        .filter((item): item is RecurringIncome => item !== null);
};

const sanitizeRecurringBills = (items: any): RecurringBill[] => {
    if (!Array.isArray(items)) return [];
    return items
        .map(item => {
            if (!item || typeof item !== 'object') return null;
            // Validate category against new Enum. If invalid, default to BILLS or OTHER.
            // Defaulting to BILLS ('فواتير') seems safer for recurring bills if unknown, or OTHER.
            // Let's check if it is 'Bills' or 'Rent' specifically, but simpler to default to OTHER if not found.
            let category: ExpenseCategory = ExpenseCategory.BILLS; // Default for recurring usually bills
            
            // Try to keep specific logic if possible, otherwise check enum
            if (typeof item.category === 'string' && Object.values(ExpenseCategory).includes(item.category as ExpenseCategory)) {
                category = item.category as ExpenseCategory;
            } else {
                // Fallback for migration
                category = ExpenseCategory.OTHER;
            }

            let recurrenceType: RecurrenceType = RecurrenceType.MONTHLY;
            if (typeof item.recurrenceType === 'string' && Object.values(RecurrenceType).includes(item.recurrenceType)) {
                recurrenceType = item.recurrenceType;
            }
            const saneItem: RecurringBill = {
                id: safeString(item.id, generateId()),
                name: safeString(item.name, 'فاتورة ثابتة بدون اسم'),
                amount: Number(item.amount) || 0,
                recurrenceType: recurrenceType,
                category: category,
                dayOfMonth: sanitizeOptionalNumber(item.dayOfMonth),
                month: sanitizeOptionalNumber(item.month),
                day: sanitizeOptionalNumber(item.day),
            };
            if (item.lastAddedDate) {
                saneItem.lastAddedDate = ensureISOString(item.lastAddedDate);
            }
            return saneItem;
        })
        .filter((item): item is RecurringBill => item !== null);
};

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
            const cleanData = removeUndefined(newUserdata);
            await setDoc(userDocRef, cleanData);
            return newUserdata;
        } catch (error) {
            console.error("Error creating user document:", error);
            return null;
        }
    }

    const userData = userSnapshot.data() as any || {};
    const state = userData.financeState || {};
    
    const sanitizedHistory = (Array.isArray(state.history) ? state.history : [])
        .map((record: any) => {
             if (!record || typeof record !== 'object') return null;
            return {
                month: Number(record.month) || 0,
                year: Number(record.year) || now.getFullYear(),
                totalIncome: Number(record.totalIncome) || 0,
                totalExpenses: Number(record.totalExpenses) || 0,
                savings: Number(record.savings) || 0,
                incomeSources: sanitizeIncomes(record.incomeSources),
                expenses: sanitizeExpenses(record.expenses),
            };
        })
        .filter((item): item is MonthlyRecord => item !== null);
        
    const sanitizedFinanceState: FinanceState = {
        incomeSources: sanitizeIncomes(state.incomeSources),
        expenses: sanitizeExpenses(state.expenses),
        recurringBills: sanitizeRecurringBills(state.recurringBills),
        recurringIncomes: sanitizeRecurringIncomes(state.recurringIncomes),
        goal: (state.goal && typeof state.goal === 'object')
            ? {
                name: safeString(state.goal.name, 'هدف بدون اسم'),
                targetAmount: Number(state.goal.targetAmount) || 1000,
                savedAmount: Number(state.goal.savedAmount) || 0,
                durationMonths: Number(state.goal.durationMonths) || 1,
              }
            : null,
        history: sanitizedHistory,
        lastActiveMonth: typeof state.lastActiveMonth === 'number' ? state.lastActiveMonth : now.getMonth(),
        lastActiveYear: typeof state.lastActiveYear === 'number' ? state.lastActiveYear : now.getFullYear(),
    };
    
    const finalCreatedAt = (userData.createdAt && typeof userData.createdAt.toDate === 'function') 
        ? userData.createdAt.toDate() 
        : new Date();

    return {
        createdAt: finalCreatedAt,
        financeState: sanitizedFinanceState,
        chatHistory: sanitizeChatHistory(userData.chatHistory),
    };
};


export const updateUserData = async (uid: string, data: { financeState: FinanceState, chatHistory: ChatMessage[] }) => {
    const userDocRef = doc(db, 'users', uid);
    try {
        // Ensure we are saving clean data
        const cleanData = removeUndefined(data);
        await setDoc(userDocRef, cleanData, { merge: true });
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
