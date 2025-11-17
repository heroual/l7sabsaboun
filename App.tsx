import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChartBarIcon, SparklesIcon, TrashIcon, WalletIcon, PaperAirplaneIcon, PencilIcon, PlusCircleIcon, AgentIcon } from './components/icons';
import { Card } from './components/Card';
import { ProgressBar } from './components/ProgressBar';
import { getFinancialUpdate } from './services/geminiService';
import { FinanceState, Expense, IncomeSource, Goal, GeminiAction, ExpenseCategory, ChatMessage, FirebaseUser } from './types';
import { auth, onAuthStateChangedListener, signOut, getOrCreateUserDocument, updateUserData } from './services/firebase';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import AnalysisCard from './components/AnalysisCard';

// MODAL COMPONENTS

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expense: Omit<Expense, 'id' | 'date'> & { date: string }) => void;
    expense: Expense | null;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave, expense }) => {
    const [name, setName] = useState(expense?.name || '');
    const [amount, setAmount] = useState(expense?.amount?.toString() || '');
    const [category, setCategory] = useState(expense?.category || ExpenseCategory.DAILY);
    const [date, setDate] = useState(expense?.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if(isOpen) {
            setName(expense?.name || '');
            setAmount(expense?.amount?.toString() || '');
            setCategory(expense?.category || ExpenseCategory.DAILY);
            setDate(expense?.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, expense]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !amount || Number(amount) <= 0) return;
        onSave({
            name,
            amount: Number(amount),
            category,
            date: new Date(date).toISOString()
        });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'تعديل المصروف' : 'مصروف جديد'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="exp-name" className="text-sm font-medium text-slate-700">السمية</label>
                    <input id="exp-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
                </div>
                <div>
                    <label htmlFor="exp-amount" className="text-sm font-medium text-slate-700">المبلغ (درهم)</label>
                    <input id="exp-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
                </div>
                 <div>
                    <label htmlFor="exp-date" className="text-sm font-medium text-slate-700">التاريخ</label>
                    <input id="exp-date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
                </div>
                <div>
                    <label htmlFor="exp-category" className="text-sm font-medium text-slate-700">الصنف</label>
                    <select id="exp-category" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition bg-white">
                        {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">إلغاء</button>
                    <button type="submit" className="px-6 py-2 rounded-full text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 transition">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

interface IncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (income: Omit<IncomeSource, 'id' | 'date'> & { date: string }) => void;
    income: IncomeSource | null;
}

const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose, onSave, income }) => {
    const [name, setName] = useState(income?.name || '');
    const [amount, setAmount] = useState(income?.amount?.toString() || '');
    const [date, setDate] = useState(income?.date ? income.date.split('T')[0] : new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if(isOpen) {
            setName(income?.name || '');
            setAmount(income?.amount?.toString() || '');
            setDate(income?.date ? income.date.split('T')[0] : new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, income]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !amount || Number(amount) <= 0) return;
        onSave({
            name,
            amount: Number(amount),
            date: new Date(date).toISOString()
        });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={income ? 'تعديل المدخول' : 'مدخول جديد'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="inc-name" className="text-sm font-medium text-slate-700">المصدر</label>
                    <input id="inc-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                </div>
                <div>
                    <label htmlFor="inc-amount" className="text-sm font-medium text-slate-700">المبلغ (درهم)</label>
                    <input id="inc-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                </div>
                 <div>
                    <label htmlFor="inc-date" className="text-sm font-medium text-slate-700">التاريخ</label>
                    <input id="inc-date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">إلغاء</button>
                    <button type="submit" className="px-6 py-2 rounded-full text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};


interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<Goal, 'savedAmount'>) => void;
    goal: Goal | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, goal }) => {
    const [name, setName] = useState(goal?.name || '');
    const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() || '');
    const [durationMonths, setDurationMonths] = useState(goal?.durationMonths?.toString() || '');
    
     useEffect(() => {
        if(isOpen) {
            setName(goal?.name || '');
            setTargetAmount(goal?.targetAmount?.toString() || '');
            setDurationMonths(goal?.durationMonths?.toString() || '');
        }
    }, [isOpen, goal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !targetAmount || !durationMonths || Number(targetAmount) <= 0 || Number(durationMonths) <= 0) return;
        onSave({
            name,
            targetAmount: Number(targetAmount),
            durationMonths: Number(durationMonths)
        });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={goal ? 'تعديل الهدف' : 'هدف جديد'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="goal-name" className="text-sm font-medium text-slate-700">علاش باغي تجمع الفلوس؟</label>
                    <input id="goal-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 transition" />
                </div>
                <div>
                    <label htmlFor="goal-amount" className="text-sm font-medium text-slate-700">شحال بغيتي تجمع (درهم)</label>
                    <input id="goal-amount" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required min="1" step="any" className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 transition" />
                </div>
                <div>
                    <label htmlFor="goal-duration" className="text-sm font-medium text-slate-700">فشحال من شهر؟</label>
                    <input id="goal-duration" type="number" value={durationMonths} onChange={e => setDurationMonths(e.target.value)} required min="1" step="1" className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 transition" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">إلغاء</button>
                    <button type="submit" className="px-6 py-2 rounded-full text-sm font-semibold text-white bg-violet-500 hover:bg-violet-600 transition">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};


// INLINE CHAT COMPONENT
const ChatInterface: React.FC<{
  chatHistory: ChatMessage[];
  userInput: string;
  setUserInput: (value: string) => void;
  handleUserInput: (text: string) => Promise<void>;
  isLoading: boolean;
  suggestions: string[];
  isPopup?: boolean;
  onClose?: () => void;
}> = ({ chatHistory, userInput, setUserInput, handleUserInput, isLoading, suggestions, isPopup, onClose }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(userInput.trim()) {
        handleUserInput(userInput);
    }
  }

  const chatContent = (
      <div className={`flex flex-col ${isPopup ? 'h-[30rem]' : 'h-80'}`}>
          <div className="flex-grow overflow-y-auto p-4">
              <div className="space-y-4">
                  {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex items-end gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.type === 'agent' && <AgentIcon className="h-8 w-8 text-teal-500 flex-shrink-0" />}
                      <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.type === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                      <p className="break-words text-sm">{msg.text}</p>
                      </div>
                  </div>
                  ))}
                  <div ref={chatEndRef} />
              </div>
          </div>
          <div className="flex-shrink-0 pt-2 px-4 pb-4">
              {suggestions.length > 0 && !isLoading && (
                  <div className="flex flex-wrap gap-2 mb-2 justify-center">
                      {suggestions.map((s, i) => (
                          <button key={i} onClick={() => handleUserInput(s)} className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-100 rounded-full hover:bg-teal-200 transition">
                              {s}
                          </button>
                      ))}
                  </div>
              )}
              <form onSubmit={onFormSubmit} className="flex gap-2">
                  <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={isLoading ? 'كيفكر...' : 'قول ليا شنو درتي بفلوسك...'}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                  />
                  <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-teal-500 text-white rounded-full p-3 hover:bg-teal-600 disabled:bg-slate-300 transition-all duration-200 transform disabled:scale-100 hover:scale-105 active:scale-95">
                  <PaperAirplaneIcon className="h-6 w-6" />
                  </button>
              </form>
          </div>
      </div>
  );

  if (isPopup) {
      return (
          <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b bg-slate-50 rounded-t-2xl flex-shrink-0">
                  <div className="flex items-center gap-2">
                      <SparklesIcon className="h-6 w-6 text-teal-500" />
                      <h3 className="text-lg font-bold text-slate-800">لحساب صابون</h3>
                  </div>
                  <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl font-bold">&times;</button>
              </div>
              {chatContent}
          </div>
      )
  }

  return (
    <Card title="هضر مع لحساب صابون" icon={<SparklesIcon className="h-7 w-7 text-teal-500" />}>
        {chatContent}
    </Card>
  );
};


// MAIN APP COMPONENT

const initialFinanceState: FinanceState = {
  incomeSources: [],
  expenses: [],
  goal: null,
};

const quickActions = [
    "زيد مصروف",
    "زيد مدخول",
    "دير ليا هدف",
    "وريني تقرير الشهر",
    "عاوني نجمع الفلوس"
];

const followUpSuggestions = [
    "بغيتي نزيد مصروف آخر؟",
    "نديرو هدف جديد؟",
    "نشوفو تحليل المصاريف؟"
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');

  const [financeState, setFinanceState] = useState<FinanceState>(initialFinanceState);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(quickActions);
  const isInitialDataLoaded = useRef(false);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (user) => {
      if (user) {
        const data = await getOrCreateUserDocument(user);
        if (data) {
          // Basic migration for old data structure
          if ((data.financeState as any).income) {
              const oldIncome = (data.financeState as any).income;
              const migratedState = {
                  ...data.financeState,
                  incomeSources: oldIncome.salary > 0 ? [{ id: 'migrated-salary', name: 'راتب شهري', amount: oldIncome.salary, date: new Date().toISOString() }] : [],
              };
              delete (migratedState as any).income;
              setFinanceState(migratedState as FinanceState);
          } else {
              setFinanceState(data.financeState);
          }
          setChatHistory(data.chatHistory);
          setSuggestions(quickActions);
        }
        isInitialDataLoaded.current = true;
      } else {
        setFinanceState(initialFinanceState);
        setChatHistory([]);
        setSuggestions(quickActions);
        isInitialDataLoaded.current = false;
      }
       setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (currentUser && isInitialDataLoaded.current) {
      updateUserData(currentUser.uid, { financeState, chatHistory });
    }
  }, [financeState, chatHistory, currentUser]);


  const handleDeleteExpense = (expenseId: string) => {
      setFinanceState(prev => ({
          ...prev,
          expenses: prev.expenses.filter(exp => exp.id !== expenseId)
      }));
  };
  
    const handleDeleteIncome = (incomeId: string) => {
      setFinanceState(prev => ({
          ...prev,
          incomeSources: prev.incomeSources.filter(inc => inc.id !== incomeId)
      }));
  };

  const handleUserInput = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const currentInput = text;

    setChatHistory(prev => [...prev, { type: 'user', text: currentInput }]);
    setUserInput('');
    setIsLoading(true);
    setSuggestions([]);

    try {
      const result = await getFinancialUpdate(currentInput, financeState);
      
      setFinanceState(prevState => {
        let newState = { ...prevState };
        switch (result.action) {
          case GeminiAction.ADD_INCOME_SOURCE:
            const newIncomePayload = (result.payload as { incomeSource: Omit<IncomeSource, 'id' | 'date'> }).incomeSource;
            if(newIncomePayload) {
              const newIncomeSource: IncomeSource = {
                ...newIncomePayload,
                id: new Date().toISOString() + Math.random(),
                date: new Date().toISOString(),
              };
              newState.incomeSources = [...prevState.incomeSources, newIncomeSource];
            }
            break;
          case GeminiAction.ADD_EXPENSE:
            const newExpensePayload = (result.payload as { expense: Omit<Expense, 'id' | 'date'> }).expense;
            if(newExpensePayload) {
              const newExpense: Expense = {
                  ...newExpensePayload,
                  id: new Date().toISOString() + Math.random(),
                  date: new Date().toISOString(),
              };
              newState.expenses = [...prevState.expenses, newExpense];
            }
            break;
          case GeminiAction.SET_GOAL:
            const newGoalPayload = (result.payload as { goal: Omit<Goal, 'savedAmount'> }).goal;
             if(newGoalPayload) {
                 newState.goal = { ...newGoalPayload, savedAmount: 0 };
             }
            break;
           case GeminiAction.DELETE_EXPENSE:
            const { id } = result.payload as { id: string };
            if (id) {
              handleDeleteExpense(id); // Use centralized handler
            }
            break;
          default:
            break;
        }
        return newState;
      });

      setChatHistory(prev => [...prev, { type: 'agent', text: result.responseMessage }]);
      setSuggestions(followUpSuggestions);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { type: 'agent', text: 'سمح ليا، ماقدرتش نفهم. عاود بطريقة أخرى.' }]);
      setSuggestions(quickActions);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, financeState]);

  const totalIncome = useMemo(() => {
    return financeState.incomeSources.reduce((sum, source) => sum + source.amount, 0);
  }, [financeState.incomeSources]);

  const totalExpenses = useMemo(() => {
    return financeState.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [financeState.expenses]);

  const savings = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  const goalProgress = useMemo(() => {
    if (!financeState.goal) return 0;
    if (financeState.goal.targetAmount === 0) return 0;
    const currentSaved = Math.max(0, savings);
    return (currentSaved / financeState.goal.targetAmount) * 100;
  }, [financeState.goal, savings]);

  const getExpensesByCategory = (category: ExpenseCategory) => {
    return financeState.expenses.filter(e => e.category === category).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  const getIncomesSorted = () => {
      return [...financeState.incomeSources].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  const handleLogout = async () => {
    isInitialDataLoaded.current = false;
    await signOut(auth);
    setAuthView('landing');
  };

  // Modal Handlers
  const handleOpenExpenseModal = (expense: Expense | null) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };
  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };
  const handleSaveExpense = (savedExpense: Omit<Expense, 'id' | 'date'> & { date: string }) => {
    setFinanceState(prev => {
      let updatedExpenses: Expense[];
      if (editingExpense) {
        updatedExpenses = prev.expenses.map(exp => exp.id === editingExpense.id ? { ...exp, ...savedExpense } : exp);
      } else {
        const newExpense: Expense = { ...savedExpense, id: new Date().toISOString() + Math.random() };
        updatedExpenses = [...prev.expenses, newExpense];
      }
      return { ...prev, expenses: updatedExpenses };
    });
    handleCloseExpenseModal();
  };
  
    const handleOpenIncomeModal = (income: IncomeSource | null) => {
    setEditingIncome(income);
    setIsIncomeModalOpen(true);
  };
  const handleCloseIncomeModal = () => {
    setIsIncomeModalOpen(false);
    setEditingIncome(null);
  };
  const handleSaveIncome = (savedIncome: Omit<IncomeSource, 'id' | 'date'> & { date: string }) => {
    setFinanceState(prev => {
      let updatedIncomes: IncomeSource[];
      if (editingIncome) {
        updatedIncomes = prev.incomeSources.map(inc => inc.id === editingIncome.id ? { ...inc, ...savedIncome } : inc);
      } else {
        const newIncome: IncomeSource = { ...savedIncome, id: new Date().toISOString() + Math.random() };
        updatedIncomes = [...prev.incomeSources, newIncome];
      }
      return { ...prev, incomeSources: updatedIncomes };
    });
    handleCloseIncomeModal();
  };
  
  const handleOpenGoalModal = () => setIsGoalModalOpen(true);
  const handleCloseGoalModal = () => setIsGoalModalOpen(false);
  const handleSaveGoal = (goalData: Omit<Goal, 'savedAmount'>) => {
    setFinanceState(prev => ({ ...prev, goal: { ...goalData, savedAmount: prev.goal?.savedAmount || 0 } }));
    handleCloseGoalModal();
  };
  const handleDeleteGoal = () => {
    setFinanceState(prev => ({ ...prev, goal: null }));
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div></div>;
  }

  if (!currentUser) {
    switch (authView) {
      case 'login': return <AuthForm mode="login" setAuthView={setAuthView} />;
      case 'register': return <AuthForm mode="register" setAuthView={setAuthView} />;
      default: return <LandingPage setAuthView={setAuthView} />;
    }
  }

  const ExpenseList: React.FC<{ expenses: Expense[], title: string }> = ({ expenses, title }) => (
    <div>
      <h4 className="font-semibold text-slate-700 mt-4 mb-2">{title}</h4>
      {expenses.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {expenses.map(exp => (
            <li key={exp.id} className="flex justify-between items-center p-2 rounded-md bg-slate-50 group">
              <div>
                  <span>{exp.name}</span>
                  <span className="text-xs text-slate-400 block">{new Date(exp.date).toLocaleDateString('ar-MA')}</span>
              </div>
              <div className="flex items-center gap-2">
                  <span className="font-semibold text-red-500">{exp.amount.toFixed(2)} درهم</span>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenExpenseModal(exp)} className="text-slate-400 hover:text-blue-600">
                          <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteExpense(exp.id)} className="text-slate-400 hover:text-red-600">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                  </div>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-slate-400">ماكاين والو هنا.</p>}
    </div>
  );
  
  const IncomeList: React.FC<{ incomes: IncomeSource[] }> = ({ incomes }) => (
    <div>
      {incomes.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {incomes.map(inc => (
            <li key={inc.id} className="flex justify-between items-center p-2 rounded-md bg-slate-50 group">
              <div>
                  <span>{inc.name}</span>
                  <span className="text-xs text-slate-400 block">{new Date(inc.date).toLocaleDateString('ar-MA')}</span>
              </div>
              <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-500">{inc.amount.toFixed(2)} درهم</span>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenIncomeModal(inc)} className="text-slate-400 hover:text-blue-600">
                          <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteIncome(inc.id)} className="text-slate-400 hover:text-red-600">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                  </div>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-slate-400">ماكاين حتى مدخول.</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-50 text-slate-800">
      <header className="text-center mb-8 relative">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-transparent bg-clip-text">
          لحساب صابون
        </h1>
        <p className="text-slate-500 mt-2">الوكيل المالي ديالك، معاك ديما!</p>
        <button onClick={handleLogout} className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-red-600 transition">خروج</button>
      </header>
      
      <main className="flex-grow space-y-6">
        <h2 className="text-2xl font-bold text-center text-slate-700 pt-4 border-t">لوحة التحكم</h2>
        <Card title="فلوسك" icon={<WalletIcon className="h-7 w-7 text-teal-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-slate-500">مجموع المداخيل</p>
                    <p className="text-2xl font-bold text-green-600">{totalIncome.toFixed(2)} درهم</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">مجموع المصاريف</p>
                    <p className="text-2xl font-bold text-red-600">{totalExpenses.toFixed(2)} درهم</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">لي بقى (التوفير)</p>
                    <p className="text-2xl font-bold text-slate-800">{savings.toFixed(2)} درهم</p>
                </div>
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="المداخيل" icon={<WalletIcon className="h-7 w-7 text-green-500" />}>
                 <button onClick={() => handleOpenIncomeModal(null)} className="flex items-center justify-center w-full gap-2 py-2 mb-4 text-sm font-semibold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>أضف مدخول</span>
                </button>
                <IncomeList incomes={getIncomesSorted()} />
            </Card>
            <Card title="المصاريف" icon={<ChartBarIcon className="h-7 w-7 text-amber-500" />}>
                <button onClick={() => handleOpenExpenseModal(null)} className="flex items-center justify-center w-full gap-2 py-2 mb-4 text-sm font-semibold text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>أضف مصروف</span>
                </button>
                <ExpenseList expenses={getExpensesByCategory(ExpenseCategory.DAILY)} title="يومية" />
                <ExpenseList expenses={getExpensesByCategory(ExpenseCategory.MONTHLY_SHOPPING)} title="تقضية ديال الشهر" />
                <ExpenseList expenses={getExpensesByCategory(ExpenseCategory.MONTHLY_BILLS)} title="فواتير شهرية" />
                <ExpenseList expenses={getExpensesByCategory(ExpenseCategory.ANNUAL)} title="سنوية" />
            </Card>
        </div>

        <Card title="الهدف ديالك" icon={<SparklesIcon className="h-7 w-7 text-violet-500" />}>
            {financeState.goal ? (
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{financeState.goal.name}</h3>
                        <p className="text-2xl font-bold text-violet-600 my-2">{financeState.goal.targetAmount.toFixed(2)} درهم</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleOpenGoalModal} className="text-slate-400 hover:text-blue-600 p-1 rounded-full"><PencilIcon className="h-5 w-5"/></button>
                        <button onClick={handleDeleteGoal} className="text-slate-400 hover:text-red-600 p-1 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                </div>
                <div className="my-4">
                <div className="flex justify-between text-sm mb-1">
                    <span>لي جمعتي: {Math.max(0, savings).toFixed(2)} درهم</span>
                    <span>{goalProgress.toFixed(1)}%</span>
                </div>
                <ProgressBar value={goalProgress} colorClass="bg-violet-500"/>
                </div>
                <div className="text-xs text-slate-500 grid grid-cols-3 text-center mt-3">
                <div>
                    <p className="font-bold">شهريا</p>
                    <p>{(financeState.goal.targetAmount / financeState.goal.durationMonths).toFixed(2)}</p>
                </div>
                <div>
                    <p className="font-bold">أسبوعيا</p>
                    <p>{(financeState.goal.targetAmount / (financeState.goal.durationMonths * 4.33)).toFixed(2)}</p>
                </div>
                <div>
                    <p className="font-bold">يوميا</p>
                    <p>{(financeState.goal.targetAmount / (financeState.goal.durationMonths * 30)).toFixed(2)}</p>
                </div>
                </div>
            </div>
            ) : (
            <div className="text-center py-4">
                <p className="text-slate-400 mb-4">يلاه نديرو شي هدف! قول ليا علاش بغيتي تجمع الفلوس.</p>
                <button onClick={handleOpenGoalModal} className="flex items-center justify-center w-full max-w-xs mx-auto gap-2 py-2 text-sm font-semibold text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>أضف هدف جديد</span>
                </button>
            </div>
            )}
        </Card>
        
        <AnalysisCard expenses={financeState.expenses} />
      </main>

       {/* CHAT POPUP & BUTTON */}
        <div className="fixed bottom-8 right-8 z-50">
            {isChatOpen ? (
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-out origin-bottom-right">
                    <ChatInterface
                        chatHistory={chatHistory}
                        userInput={userInput}
                        setUserInput={setUserInput}
                        handleUserInput={handleUserInput}
                        isLoading={isLoading}
                        suggestions={suggestions}
                        isPopup={true}
                        onClose={() => setIsChatOpen(false)}
                    />
                </div>
            ) : (
                 <button
                    onClick={() => setIsChatOpen(true)}
                    className="bg-teal-500 text-white rounded-full p-4 shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-110"
                    aria-label="Ouvrir le chat"
                >
                    <SparklesIcon className="h-8 w-8" />
                </button>
            )}
        </div>


      {isExpenseModalOpen && (
          <ExpenseModal 
              isOpen={isExpenseModalOpen}
              onClose={handleCloseExpenseModal}
              onSave={handleSaveExpense}
              expense={editingExpense}
          />
      )}
       {isIncomeModalOpen && (
          <IncomeModal 
              isOpen={isIncomeModalOpen}
              onClose={handleCloseIncomeModal}
              onSave={handleSaveIncome}
              income={editingIncome}
          />
      )}
      {isGoalModalOpen && (
          <GoalModal
              isOpen={isGoalModalOpen}
              onClose={handleCloseGoalModal}
              onSave={handleSaveGoal}
              goal={financeState.goal}
          />
      )}
    </div>
  );
};

export default App;
