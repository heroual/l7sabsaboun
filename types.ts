
import { Type } from "@google/genai";
import type { User as FirebaseUser } from "firebase/auth";


export enum ExpenseCategory {
  RENT = 'كراء',
  BILLS = 'فواتير',
  CAR = 'الطموبيل',
  SHOPPING = 'التقدية',
  CLOTHES = 'الحوايج',
  OUTINGS = 'خرجات',
  LOANS = 'الكريديات',
  FAMILY = 'العائلة',
  CHARITY = 'الصدقة',
  OTHER = 'اخرى',
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO string
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO string
}

export interface Goal {
  name:string;
  targetAmount: number;
  savedAmount: number; // Total accumulated savings
  durationMonths: number;
}

export enum RecurrenceType {
  MONTHLY = 'شهري',
  YEARLY = 'سنوي',
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  recurrenceType: RecurrenceType;
  dayOfMonth?: number; // For monthly
  month?: number; // For yearly (1-12)
  day?: number; // for yearly (1-31)
  lastAddedDate?: string; // ISO string to track last time it was converted to an expense
}

export interface RecurringIncome {
  id: string;
  name: string;
  amount: number;
  recurrenceType: RecurrenceType;
  dayOfMonth?: number; // For monthly
  month?: number; // For yearly (1-12)
  day?: number; // for yearly (1-31)
  lastAddedDate?: string; // ISO string to track last time it was converted to an income
}

export interface MonthlyRecord {
  month: number; // 0-11
  year: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  incomeSources: IncomeSource[];
  expenses: Expense[];
}

export type ChatMessage = {
  type: 'user' | 'agent';
  text: string;
};

export interface FinanceState {
  incomeSources: IncomeSource[]; // Current month's income
  expenses: Expense[]; // Current month's expenses
  goal: Goal | null;
  recurringBills: RecurringBill[];
  recurringIncomes: RecurringIncome[];
  history: MonthlyRecord[];
  lastActiveMonth: number;
  lastActiveYear: number;
}

export type UserData = {
  financeState: FinanceState;
  chatHistory: ChatMessage[];
  createdAt: Date;
}

export enum GeminiAction {
  ADD_INCOME_SOURCE = 'ADD_INCOME_SOURCE',
  ADD_EXPENSE = 'ADD_EXPENSE',
  SET_GOAL = 'SET_GOAL',
  GENERAL_RESPONSE = 'GENERAL_RESPONSE',
  DELETE_EXPENSE = 'DELETE_EXPENSE',
}

export interface GeminiResponse {
  action: GeminiAction;
  payload: Partial<FinanceState> | { incomeSource: Omit<IncomeSource, 'id' | 'date'> } | { expense: Omit<Expense, 'id' | 'date'> } | { id: string } | null;
  responseMessage: string;
}

export { FirebaseUser };

// Schema for the general chatbot
export const GeminiResponseSchema = {
  type: Type.OBJECT,
  properties: {
    action: {
      type: Type.STRING,
      enum: [
        'ADD_INCOME_SOURCE',
        'ADD_EXPENSE',
        'SET_GOAL',
        'GENERAL_RESPONSE',
        'DELETE_EXPENSE',
      ],
      description: 'The financial action to perform based on user input.',
    },
    payload: {
      type: Type.OBJECT,
      description: 'Data needed to perform the action. Can be an income object, expense object, goal object, or null.',
      properties: {
        incomeSource: {
          type: Type.OBJECT,
          description: "A new income source to add.",
          properties: {
            name: { type: Type.STRING },
            amount: { type: Type.NUMBER },
          },
        },
        expense: {
          type: Type.OBJECT,
          description: 'A new expense to add.',
          properties: {
            name: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: {
              type: Type.STRING,
              enum: [
                'كراء',
                'فواتير',
                'الطموبيل',
                'التقدية',
                'الحوايج',
                'خرجات',
                'الكريديات',
                'العائلة',
                'الصدقة',
                'اخرى'
              ],
            },
          },
        },
        goal: {
          type: Type.OBJECT,
          description: 'A new financial goal to set.',
          properties: {
            name: { type: Type.STRING },
            targetAmount: { type: Type.NUMBER },
            durationMonths: { type: Type.NUMBER },
          },
        },
        id: {
          type: Type.STRING,
          description: "The ID of an expense to delete."
        }
      },
    },
    responseMessage: {
      type: Type.STRING,
      description: 'A friendly, motivational response in Moroccan Darija to show to the user.',
    },
  },
  required: ['action', 'responseMessage'],
};

// Types for the public-facing chatbot
export interface PublicGeminiResponse {
  responseMessage: string;
  suggestions?: string[];
}

export const PublicGeminiResponseSchema = {
  type: Type.OBJECT,
  properties: {
    responseMessage: {
      type: Type.STRING,
      description: 'A friendly, general financial advice response in Moroccan Darija to show to the visitor.',
    },
    suggestions: {
      type: Type.ARRAY,
      description: "A short array of 2-3 follow-up questions the user might want to ask. e.g. ['كيفاش ندير ميزانية؟', 'عطيني نصائح للتوفير']",
      items: {
        type: Type.STRING,
      }
    }
  },
  required: ['responseMessage'],
};

// --- SMART SALARY SPLITTER TYPES ---

export interface BudgetAllocation {
  category: string;
  amount: number;
  percentage: number;
  isFixed: boolean; // True if it was a user input, False if AI suggested it
  note?: string; // AI comment e.g., "High for this city"
}

export interface SmartSplitResponse {
  allocations: BudgetAllocation[];
  totalExpenses: number;
  remaining: number;
  savingsRecommendation: number;
  advice: string; // General advice in Darija
  warnings: string[]; // List of specific warnings
}

export const SmartSplitResponseSchema = {
  type: Type.OBJECT,
  properties: {
    allocations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          percentage: { type: Type.NUMBER },
          isFixed: { type: Type.BOOLEAN },
          note: { type: Type.STRING }
        }
      }
    },
    totalExpenses: { type: Type.NUMBER },
    remaining: { type: Type.NUMBER },
    savingsRecommendation: { type: Type.NUMBER },
    advice: { type: Type.STRING },
    warnings: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ['allocations', 'totalExpenses', 'remaining', 'savingsRecommendation', 'advice']
};
