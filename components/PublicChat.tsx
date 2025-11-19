
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { getPublicFinancialAdvice, ensureString } from '../services/geminiService';

const initialSuggestions = [
    "كيفاش ندير ميزانية؟",
    "عطيني شي نصائح للتوفير",
    "شنو هوما أهم المصاريف؟",
];

export const PublicChat: React.FC = () => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { type: 'agent', text: 'مرحبا! أنا لحساب صابون. سولني أي حاجة على الفلوس و التسيير المالي و نجاوبك.'}
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);
    const chatEndRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleUserInput = async (text: string) => {
        if (!text.trim() || isLoading) return;
        
        const currentInput = text;
        const newHistory = [...chatHistory, { type: 'user', text: currentInput }];
        setChatHistory(newHistory);
        setUserInput('');
        setIsLoading(true);
        setSuggestions([]);

        try {
            const result = await getPublicFinancialAdvice(currentInput, newHistory);
            
            // STRICTLY Sanitize response message to prevent Object rendering (React Error #310)
            // Use the ensureString helper we exported to maintain consistency
            const safeMessage = ensureString(result.responseMessage);

            setChatHistory(prev => [...prev, { type: 'agent', text: safeMessage }]);
            
            // STRICTLY Sanitize suggestions
            if (result.suggestions && Array.isArray(result.suggestions)) {
                 const safeSuggestions = result.suggestions
                    .filter(s => s !== null && s !== undefined)
                    .map(s => ensureString(s));
                
                if (safeSuggestions.length > 0) {
                    setSuggestions(safeSuggestions);
                } else {
                    setSuggestions(initialSuggestions);
                }
            } else {
                setSuggestions(initialSuggestions); // fallback suggestions
            }
        } catch(error) {
            console.error(error);
            setChatHistory(prev => [...prev, { type: 'agent', text: 'سمح ليا، ماقدرتش نفهم. عاود بطريقة أخرى.' }]);
            setSuggestions(initialSuggestions);
        } finally {
            setIsLoading(false);
        }
    };
  
    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(userInput.trim()) {
            handleUserInput(userInput);
        }
    };

    return (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-majorelle-blue dark:text-white">جرب تهضر مع لحساب صابون</h2>
                <div className="w-10 h-10 bg-brand-gold/20 dark:bg-brand-gold/30 rounded-full flex items-center justify-center">
                    <span className="material-icons text-brand-gold text-xl">smart_toy</span>
                </div>
            </div>

            <div className="space-y-4 mb-6 h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex gap-3 items-start ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.type === 'agent' && (
                            <div className="w-8 h-8 bg-sandy-beige dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg">support_agent</span>
                            </div>
                        )}
                        <div className={`p-3 rounded-lg shadow-sm max-w-[85%] ${msg.type === 'user' 
                            ? 'bg-majorelle-blue text-white rounded-bl-none' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tr-none'}`
                        }>
                             {/* Double defense: render text with String() wrapper to catch objects */}
                            <p className="text-sm break-words">{typeof msg.text === 'object' ? JSON.stringify(msg.text) : String(msg.text)}</p>
                        </div>
                         {msg.type === 'user' && (
                            <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary dark:text-green-300 text-lg">person</span>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {!isLoading && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-start mb-6">
                    {suggestions.map((s, i) => (
                        <button key={i} onClick={() => handleUserInput(s)} className="text-xs sm:text-sm bg-primary/10 dark:bg-primary/20 text-primary font-medium py-1.5 px-3 rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                            {typeof s === 'object' ? JSON.stringify(s) : String(s)}
                        </button>
                    ))}
                </div>
            )}
            
            <form onSubmit={onFormSubmit} className="relative">
                <input 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-full py-3 pr-12 pl-4 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 transition-colors" 
                    placeholder={isLoading ? "كيفكر..." : "كتب سؤالك هنا..."} 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button type="submit" disabled={isLoading || !userInput.trim()} className="text-slate-400 dark:text-slate-500 hover:text-primary disabled:text-slate-300 transition-colors p-1">
                    <span className="material-icons">send</span>
                  </button>
                </div>
            </form>
        </div>
    );
};
