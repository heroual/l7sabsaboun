import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { Card } from './Card';
import { ChartPieIcon } from './icons';

interface AnalysisCardProps {
  expenses: Expense[];
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ expenses }) => {
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const dailyTotal = useMemo(() => {
    return expenses
      .filter(e => e.date.startsWith(todayStr))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  const monthlyData = useMemo(() => {
    const monthlyExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory = monthlyExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    return { total, byCategory };
  }, [expenses, currentMonth, currentYear]);

  const yearlyData = useMemo(() => {
    const yearlyExpenses = expenses.filter(e => new Date(e.date).getFullYear() === currentYear);
    
    const byMonth = Array(12).fill(0);
    yearlyExpenses.forEach(e => {
        const month = new Date(e.date).getMonth();
        byMonth[month] += e.amount;
    });
    
    const total = byMonth.reduce((sum, amount) => sum + amount, 0);
    const maxMonth = Math.max(...byMonth, 1); // Avoid division by zero

    return { byMonth, total, maxMonth };
  }, [expenses, currentYear]);

  const categoryColors: Record<ExpenseCategory, string> = {
    [ExpenseCategory.DAILY]: 'bg-blue-400',
    [ExpenseCategory.MONTHLY_SHOPPING]: 'bg-amber-400',
    [ExpenseCategory.MONTHLY_BILLS]: 'bg-red-400',
    [ExpenseCategory.ANNUAL]: 'bg-purple-400',
  };

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];


  const renderContent = () => {
    switch (view) {
      case 'daily':
        return (
          <div className="text-center">
            <p className="text-sm text-slate-500">مجموع مصاريف اليوم</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{dailyTotal.toFixed(2)} درهم</p>
          </div>
        );
      case 'monthly':
        return (
          <div>
            <div className="flex justify-between items-baseline mb-4">
                <p className="text-sm text-slate-500">مصاريف الشهر</p>
                <p className="text-xl font-bold text-red-600">{monthlyData.total.toFixed(2)} درهم</p>
            </div>
            <div className="space-y-3">
                {/* FIX: Cast the result of Object.entries to ensure correct type inference for amount. */}
                {(Object.entries(monthlyData.byCategory) as [string, number][]).sort(([,a], [,b]) => b - a).map(([category, amount]) => (
                    <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                            <span>{category}</span>
                            <span className="font-semibold">{amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className={`${categoryColors[category as ExpenseCategory]} h-2.5 rounded-full`} style={{ width: `${monthlyData.total > 0 ? (amount / monthlyData.total) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                ))}
                {Object.keys(monthlyData.byCategory).length === 0 && <p className="text-sm text-slate-400 text-center py-4">مازال ما صرفتي والو هاد الشهر.</p>}
            </div>
          </div>
        );
      case 'yearly':
         return (
          <div>
            <div className="flex justify-between items-baseline mb-4">
                <p className="text-sm text-slate-500">مصاريف السنة</p>
                <p className="text-xl font-bold text-red-600">{yearlyData.total.toFixed(2)} درهم</p>
            </div>
            <div className="space-y-2 text-xs">
                {yearlyData.byMonth.map((amount, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className="w-16 text-slate-500 text-right">{monthNames[index]}</span>
                        <div className="flex-grow bg-slate-200 rounded-full h-4">
                            <div className="bg-teal-500 h-4 rounded-full text-white text-left px-1 flex items-center" style={{ width: `${(amount / yearlyData.maxMonth) * 100}%` }}>
                                {amount > 0 && <span className="text-xs font-semibold">{amount.toFixed(0)}</span>}
                            </div>
                        </div>
                    </div>
                ))}
                 {yearlyData.total === 0 && <p className="text-sm text-slate-400 text-center py-4">مازال ما صرفتي والو هاد العام.</p>}
            </div>
          </div>
        );
    }
  };

  const getButtonClass = (buttonView: typeof view) => 
    `px-4 py-1.5 text-sm font-semibold rounded-full transition ${view === buttonView ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`;

  return (
    <Card title="تحليل المصاريف" icon={<ChartPieIcon className="h-7 w-7 text-sky-500" />}>
        <div className="flex justify-center gap-2 mb-6">
            <button onClick={() => setView('daily')} className={getButtonClass('daily')}>يومي</button>
            <button onClick={() => setView('monthly')} className={getButtonClass('monthly')}>شهري</button>
            <button onClick={() => setView('yearly')} className={getButtonClass('yearly')}>سنوي</button>
        </div>
        <div style={{minHeight: '290px'}}>
            {renderContent()}
        </div>
    </Card>
  );
};

export default AnalysisCard;