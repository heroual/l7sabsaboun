import { Type } from "@google/genai";
import type { User as FirebaseUser } from "firebase/auth";


export enum ExpenseCategory {
  DAILY = 'يومية',
  MONTHLY_SHOPPING = 'تقضية ديال الشهر',
  MONTHLY_BILLS = 'فواتير شهرية',
  ANNUAL = 'سنوية',
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
  savedAmount: number;
  durationMonths: number;
}

export type ChatMessage = {
  type: 'user' | 'agent';
  text: string;
};

export interface FinanceState {
  incomeSources: IncomeSource[];
  expenses: Expense[];
  goal: Goal | null;
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
                'يومية',
                'تقضية ديال الشهر',
                'فواتير شهرية',
                'سنوية',
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
