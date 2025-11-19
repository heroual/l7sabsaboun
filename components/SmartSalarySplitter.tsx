
import React, { useState } from 'react';
import { PlusCircleIcon, SparklesIcon, TrashIcon } from './icons';
import { getSmartSalarySplit } from '../services/geminiService';
import { SmartSplitResponse } from '../types';

interface SmartSalarySplitterProps {
  onClose: () => void;
}

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fes", "Meknes", "Oujda", "Kenitra", "Sale", "Other"
];

export const SmartSalarySplitter: React.FC<SmartSalarySplitterProps> = ({ onClose }) => {
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [salary, setSalary] = useState<string>('');
  const [city, setCity] = useState<string>('Casablanca');
  const [expenses, setExpenses] = useState<{id: number, name: string, amount: string}[]>([
    { id: 1, name: 'الكراء', amount: '' },
    { id: 2, name: 'الما و الضو', amount: '' },
    { id: 3, name: 'التقدية', amount: '' }
  ]);
  const [goals, setGoals] = useState<string>('');
  const [result, setResult] = useState<SmartSplitResponse | null>(null);

  const handleAddExpenseRow = () => {
    setExpenses([...expenses, { id: Date.now(), name: '', amount: '' }]);
  };

  const handleRemoveExpenseRow = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleExpenseChange = (id: number, field: 'name' | 'amount', value: string) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSubmit = async () => {
    if (!salary || Number(salary) <= 0) return;
    
    setLoading(true);
    try {
      // Filter valid expenses
      const validExpenses = expenses
        .filter(e => e.name.trim() !== '' && Number(e.amount) > 0)
        .map(e => ({ name: e.name, amount: Number(e.amount) }));

      const response = await getSmartSalarySplit(
        Number(salary),
        city,
        validExpenses,
        goals
      );
      
      setResult(response);
      setStep('result');
    } catch (error) {
      console.error(error);
      // Handle error (toast or alert)
    } finally {
      setLoading(false);
    }
  };

  // VISUALS: CSS Patterns
  const leatherPattern = {
    backgroundImage: `url("https://www.transparenttextures.com/patterns/dark-leather.png"), linear-gradient(135deg, #3e2723 0%, #271c19 100%)`,
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)'
  };

  const zelligeAccent = {
    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), 
                      repeating-conic-gradient(#fde68a22 0% 25%, transparent 0% 50%)`,
    backgroundSize: '40px 40px'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-6 overflow-y-auto">
      {/* Main Book Container */}
      <div 
        className="relative w-full max-w-5xl min-h-[80vh] rounded-3xl overflow-hidden flex flex-col md:flex-row border-8 border-[#2d1b18] transition-all duration-500"
        style={leatherPattern}
      >
        {/* 3D Bookmark - Moved to LEFT and made text legible */}
        <div className="absolute top-0 left-8 w-12 h-28 bg-red-700 shadow-lg z-20 transform hover:translate-y-2 transition-transform flex flex-col items-center justify-end pb-3 rounded-b-lg border-x border-b border-white/10">
           <div className="text-[10px] text-white font-bold uppercase tracking-widest rotate-90 mb-8 whitespace-nowrap drop-shadow-md">Powered by Sou9 EL AI</div>
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-300 to-yellow-600 shadow-inner border border-yellow-100 flex items-center justify-center">
              <span className="text-[8px] font-bold text-yellow-900">AI</span>
           </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-display animate-pulse">الذكاء الاصطناعي كيحسب ليك الميزانية...</p>
          </div>
        )}

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-30 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition">
           <span className="material-symbols-outlined">close</span>
        </button>

        {/* FIRST PAGE (RIGHT in RTL): INPUTS */}
        <div className={`w-full md:w-1/2 p-6 md:p-10 relative transition-transform duration-500 ${step === 'result' && window.innerWidth < 768 ? 'hidden' : ''}`} style={{ backgroundColor: '#f8f5e6' }}>
           <div className="absolute inset-0 pointer-events-none opacity-30" style={zelligeAccent}></div>
           
           <div className="relative z-10">
              <h2 className="text-3xl font-bold text-[#3e2723] mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-600 text-3xl">menu_book</span>
                الكناش الدكي لتقسيم الصالير
              </h2>
              <p className="text-slate-500 text-sm mb-6 font-medium">تخطيط ذكي للراتب - حسب المدينة والأهداف</p>

              <div className="space-y-6">
                {/* Salary & City */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">شحال كتشد فالشهر؟</label>
                        <input 
                            type="number" 
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-slate-300 focus:border-yellow-600 px-2 py-2 text-xl font-bold text-[#3e2723] focus:outline-none transition-colors placeholder-slate-300"
                            placeholder="مثلا: 5000"
                        />
                    </div>
                    <div className="w-1/3">
                         <label className="block text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">المدينة فين ساكن</label>
                         <select 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-slate-300 focus:border-yellow-600 px-0 py-2.5 text-sm font-semibold text-[#3e2723] focus:outline-none"
                         >
                            {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c === 'Other' ? 'مدينة أخرى' : c}</option>)}
                         </select>
                    </div>
                </div>

                {/* Expenses List (Notebook Style) */}
                <div className="relative min-h-[300px] border border-slate-200 rounded-lg overflow-hidden bg-[#fffcf5] shadow-inner">
                     {/* CSS Lines */}
                     <div className="absolute inset-0 pointer-events-none opacity-50" style={{backgroundImage: `repeating-linear-gradient(transparent, transparent 39px, #cbd5e1 39px, #cbd5e1 40px)`}}></div>
                     
                     <div className="p-4 relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-[#3e2723] bg-[#fffcf5] px-2 rounded">المصاريف اللي ديما عندك</h3>
                            <button onClick={handleAddExpenseRow} className="text-yellow-600 hover:text-yellow-700 text-sm font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-lg">add</span>
                                زيد مصروف
                            </button>
                        </div>
                        
                        <div className="space-y-2"> {/* Adjusted spacing to match 40px line height approx */}
                             {expenses.map((exp, i) => (
                                 <div key={exp.id} className="flex items-center gap-2 h-[32px]">
                                     <span className="text-slate-400 text-xs font-mono w-4">{i+1}.</span>
                                     <input 
                                        type="text" 
                                        value={exp.name}
                                        onChange={(e) => handleExpenseChange(exp.id, 'name', e.target.value)}
                                        placeholder="شنو المصروف؟"
                                        className="flex-1 bg-transparent border-none p-0 text-sm text-slate-700 focus:ring-0 placeholder-slate-300 font-medium"
                                     />
                                     <input 
                                        type="number" 
                                        value={exp.amount}
                                        onChange={(e) => handleExpenseChange(exp.id, 'amount', e.target.value)}
                                        placeholder="0 درهم"
                                        className="w-24 bg-transparent border-none p-0 text-sm text-left text-slate-700 font-bold focus:ring-0 placeholder-slate-300 dir-ltr"
                                     />
                                     <button onClick={() => handleRemoveExpenseRow(exp.id)} className="text-red-300 hover:text-red-500">
                                         <TrashIcon className="w-4 h-4" />
                                     </button>
                                 </div>
                             ))}
                        </div>
                     </div>
                </div>

                {/* Goals */}
                <div>
                    <label className="block text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">أهدافك المالية (اختياري)</label>
                    <textarea 
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        placeholder="مثلا: بغيت نشري موطور، بغيت نجمع لزواج، باغي نسافر..."
                        className="w-full bg-white/50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 resize-none h-20"
                    />
                </div>

                {/* Action Button */}
                <button 
                    onClick={handleSubmit}
                    disabled={loading || !salary}
                    className="w-full bg-[#3e2723] text-yellow-500 font-bold py-4 rounded-xl shadow-lg hover:bg-[#2d1b18] hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-6 h-6" />
                    حلل وقسم ليا الصالير
                </button>

              </div>
           </div>
        </div>

        {/* SECOND PAGE (LEFT in RTL): RESULTS */}
        <div className={`w-full md:w-1/2 bg-[#fff] p-6 md:p-10 relative flex flex-col ${step === 'input' ? 'hidden md:flex md:opacity-50 md:blur-[1px] md:pointer-events-none' : ''}`}>
            {/* Divider Effect (Spine) */}
            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/10 to-transparent z-20"></div>
            
            {step === 'input' && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-100 mb-4 flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl">analytics</span>
                    </div>
                    <p className="text-lg text-center px-8">عمر المعلومات فالصفحة اليمين باش تشوف التحليل والتقسيم هنا</p>
                </div>
            )}

            {step === 'result' && result && (
                <div className="flex-1 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Holographic Coin Header */}
                    <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-[#3e2723]">التقسيم المقترح</h3>
                            <p className="text-sm text-green-600 font-medium">على حساب المعيشة ف {city} وقاعدة 50/30/20</p>
                        </div>
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-200 shadow-xl flex items-center justify-center border-2 border-yellow-100 animate-pulse">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-50 w-full h-full"></div>
                            <span className="text-yellow-900 font-bold text-xs text-center leading-tight">درهم<br/>ذكي</span>
                        </div>
                    </div>

                    {/* Advice Box */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 relative">
                         <div className="absolute -top-3 -left-2 bg-blue-500 text-white p-1 rounded-full">
                             <SparklesIcon className="w-4 h-4" />
                         </div>
                         <p className="text-sm text-blue-900 italic leading-relaxed">"{result.advice}"</p>
                    </div>

                    {/* Warnings */}
                    {result.warnings && result.warnings.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {result.warnings.map((w, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                                    <span className="material-symbols-outlined text-base">warning</span>
                                    {w}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Breakdown Table */}
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-slate-400 border-b border-slate-100">
                                    <th className="text-right py-2 font-medium">المجال</th>
                                    <th className="text-left py-2 font-medium">المبلغ</th>
                                    <th className="text-left py-2 font-medium">النسبة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {result.allocations.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                                        <td className="py-3">
                                            <div className="font-bold text-slate-700">{item.category}</div>
                                            {item.note && <div className="text-[10px] text-slate-400 mt-0.5">{item.note}</div>}
                                        </td>
                                        <td className="py-3 text-left font-bold text-[#3e2723] dir-ltr">
                                            {item.amount.toFixed(0)} dh
                                        </td>
                                        <td className="py-3 text-left">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                item.percentage > 40 ? 'bg-red-100 text-red-600' : 
                                                item.percentage > 20 ? 'bg-yellow-100 text-yellow-700' : 
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {item.percentage.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary */}
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 flex justify-between items-end">
                         <div>
                             <p className="text-xs text-slate-400">توفير مقترح</p>
                             <p className="text-xl font-bold text-green-600 dir-ltr">+{result.savingsRecommendation.toFixed(0)} dh</p>
                         </div>
                         <div className="text-left">
                            <p className="text-xs text-slate-400">مجموع المصاريف</p>
                            <p className="text-lg font-bold text-slate-800 dir-ltr">{result.totalExpenses.toFixed(0)} dh</p>
                         </div>
                    </div>
                    
                    {/* Mobile Back Button */}
                    <button onClick={() => setStep('input')} className="md:hidden mt-6 w-full py-3 bg-slate-200 text-slate-600 rounded-lg font-bold">
                        رجع عدل المعلومات
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
