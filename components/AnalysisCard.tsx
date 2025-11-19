
import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { Card } from './Card';
import { ChartPieIcon } from './icons';

interface AnalysisCardProps {
  expenses: Expense[];
}

// Map categories to Tailwind Text colors for SVG 'currentColor' usage
// We will derive BG colors for the legend by replacing 'text-' with 'bg-'
const categoryColorMap: Record<ExpenseCategory, string> = {
  [ExpenseCategory.RENT]: 'text-blue-600',
  [ExpenseCategory.BILLS]: 'text-red-500',
  [ExpenseCategory.CAR]: 'text-slate-500',
  [ExpenseCategory.SHOPPING]: 'text-amber-500',
  [ExpenseCategory.CLOTHES]: 'text-purple-500',
  [ExpenseCategory.OUTINGS]: 'text-pink-500',
  [ExpenseCategory.LOANS]: 'text-orange-600',
  [ExpenseCategory.FAMILY]: 'text-green-500',
  [ExpenseCategory.CHARITY]: 'text-teal-400',
  [ExpenseCategory.OTHER]: 'text-gray-400',
};

const DonutChart: React.FC<{ 
  data: { category: string; value: number; percent: number; colorClass: string }[]; 
  total: number 
}> = ({ data, total }) => {
  if (total === 0) {
    return (
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <div className="w-full h-full rounded-full border-8 border-slate-100"></div>
        <span className="absolute text-slate-400 text-sm">لا توجد بيانات</span>
      </div>
    );
  }

  let accumulatedPercent = 0;
  const radius = 15.9155; // Circumference = 100
  const center = 20; // Center of the SVG (radius + strokeWidth/2 approx)

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="5" />
        
        {/* Segments */}
        {data.map((segment, i) => {
          // Dash array: [length of dash (percent), length of gap (100-percent)]
          const dashArray = `${segment.percent} ${100 - segment.percent}`;
          // Offset: shift start point by accumulated percentage
          const dashOffset = 100 - accumulatedPercent;
          accumulatedPercent += segment.percent;

          return (
            <circle
              key={i}
              cx="20"
              cy="20"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="5"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              className={`${segment.colorClass} transition-all duration-500 ease-out hover:opacity-80`}
            >
              <title>{`${segment.category}: ${segment.value.toFixed(2)} (${segment.percent.toFixed(1)}%)`}</title>
            </circle>
          );
        })}
      </svg>
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 pointer-events-none">
        <span className="text-xs text-slate-500 font-medium">المجموع</span>
        <span className="text-lg font-bold dir-ltr">{total.toFixed(0)}</span>
        <span className="text-[10px] text-slate-400">درهم</span>
      </div>
    </div>
  );
};

const AnalysisCard: React.FC<AnalysisCardProps> = ({ expenses }) => {
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Calculate Chart Data
  const chartData = useMemo(() => {
    let filteredExpenses: Expense[] = [];

    if (view === 'daily') {
        filteredExpenses = expenses.filter(e => e.date.startsWith(todayStr));
    } else if (view === 'monthly') {
        filteredExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
    } else { // Yearly
        filteredExpenses = expenses.filter(e => new Date(e.date).getFullYear() === currentYear);
    }

    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    const grouped = filteredExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(grouped)
        .map(([category, value]) => ({
            category,
            value,
            percent: total > 0 ? (value / total) * 100 : 0,
            colorClass: categoryColorMap[category as ExpenseCategory] || 'text-gray-400'
        }))
        .sort((a, b) => b.value - a.value); // Sort largest first

    return { data, total, filteredExpenses };
  }, [expenses, view, todayStr, currentMonth, currentYear]);

  const getButtonClass = (buttonView: typeof view) => 
    `px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${view === buttonView ? 'bg-teal-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`;

  const getTitle = () => {
      switch(view) {
          case 'daily': return 'مصاريف اليوم';
          case 'monthly': return 'مصاريف هاد الشهر';
          case 'yearly': return 'مصاريف هاد العام';
      }
  }

  return (
    <Card title="تحليل المصاريف" icon={<ChartPieIcon className="h-7 w-7 text-sky-500" />}>
        
        {/* Controls */}
        <div className="flex justify-center gap-2 mb-6 bg-slate-50 p-1 rounded-full w-fit mx-auto">
            <button onClick={() => setView('daily')} className={getButtonClass('daily')}>يومي</button>
            <button onClick={() => setView('monthly')} className={getButtonClass('monthly')}>شهري</button>
            <button onClick={() => setView('yearly')} className={getButtonClass('yearly')}>سنوي</button>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-8">
            
            {/* Chart Section */}
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
                 <DonutChart data={chartData.data} total={chartData.total} />
                 <p className="text-center font-bold text-slate-700 mt-4">{getTitle()}</p>
                 <p className="text-center text-slate-500 text-sm">{chartData.total.toFixed(2)} درهم</p>
            </div>

            {/* Legend/List Section */}
            <div className="w-full md:w-2/3">
                 {chartData.data.length > 0 ? (
                     <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                        {chartData.data.map((item) => (
                             <div key={item.category} className="group">
                                 <div className="flex justify-between items-center mb-1 text-sm">
                                     <div className="flex items-center gap-2">
                                         <div className={`w-3 h-3 rounded-full ${item.colorClass.replace('text-', 'bg-')}`}></div>
                                         <span className="font-medium text-slate-700">{item.category}</span>
                                     </div>
                                     <div className="text-right">
                                         <span className="font-bold text-slate-800 block">{item.value.toFixed(2)}</span>
                                     </div>
                                 </div>
                                 {/* Progress Bar */}
                                 <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                     <div 
                                        className={`h-full rounded-full ${item.colorClass.replace('text-', 'bg-')} transition-all duration-500`} 
                                        style={{ width: `${item.percent}%` }}
                                     ></div>
                                 </div>
                                 <p className="text-xs text-slate-400 text-left mt-0.5 dir-ltr">{item.percent.toFixed(1)}%</p>
                             </div>
                        ))}
                     </div>
                 ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8 md:py-0">
                         <ChartPieIcon className="h-12 w-12 mb-2 opacity-20" />
                         <p>مازال ما صرفتي والو ف{
                            view === 'daily' ? 'هاد النهار' : view === 'monthly' ? 'هاد الشهر' : 'هاد العام'
                         }.</p>
                     </div>
                 )}
            </div>
        </div>

        {/* Mini Insight Footer */}
        {chartData.data.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                    أكبر مصروف هو <span className={`font-bold ${chartData.data[0].colorClass}`}>{chartData.data[0].category}</span> بـ <span className="font-bold text-slate-800">{chartData.data[0].value.toFixed(0)} درهم</span>.
                </p>
            </div>
        )}
    </Card>
  );
};

export default AnalysisCard;
