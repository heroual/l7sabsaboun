import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { SparklesIcon, AgentIcon, PaperAirplaneIcon } from './icons';
import { ChatMessage } from '../types';
import { getPublicFinancialAdvice } from '../services/geminiService';


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
            setChatHistory(prev => [...prev, { type: 'agent', text: result.responseMessage }]);
            if (result.suggestions && result.suggestions.length > 0) {
                setSuggestions(result.suggestions);
            }
        } catch(error) {
            console.error(error);
            setChatHistory(prev => [...prev, { type: 'agent', text: 'سمح ليا، ماقدرتش نفهم. عاود بطريقة أخرى.' }]);
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
        <Card title="جرب تهضر مع لحساب صابون" icon={<SparklesIcon className="h-7 w-7 text-teal-500" />}>
            <div className="h-96 flex flex-col">
                <div className="flex-grow overflow-y-auto p-4 pr-0">
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
                <div className="flex-shrink-0 pt-2">
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
                        placeholder={isLoading ? 'كيفكر...' : 'كتب سؤالك هنا...'}
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                        />
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-teal-500 text-white rounded-full p-3 hover:bg-teal-600 disabled:bg-slate-300 transition-all duration-200 transform disabled:scale-100 hover:scale-105 active:scale-95">
                        <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </form>
                </div>
            </div>
        </Card>
    );
};
