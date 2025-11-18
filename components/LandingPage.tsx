import React from 'react';
import { PublicChat } from './PublicChat';

interface LandingPageProps {
  setAuthView: (view: 'login' | 'register') => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; delay: string; iconBg: string; iconColor: string; }> = 
({ icon, title, description, delay, iconBg, iconColor }) => (
  <div className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center transform hover:-translate-y-2 transition-transform duration-300 fade-in ${delay}`}>
    <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
      <span className={`material-symbols-outlined text-4xl ${iconColor}`}>{icon}</span>
    </div>
    <h3 className="text-xl font-bold mb-2 text-majorelle-blue dark:text-white">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400">{description}</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ setAuthView }) => {
  return (
    <div className="relative container mx-auto px-4 py-12 md:py-20 z-10">
      <header className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-extrabold text-5xl md:text-7xl mb-4 text-majorelle-blue dark:text-sandy-beige fade-in" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>
          لحساب صابون
        </h1>
        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 fade-in fade-in-delay-1">
          الوكيل المالي ديالك بالدارجة. تبع مصاريفك، دير أهداف، ووصل للأهداف ديالك بطريقة ساهلة ومحفزة.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in fade-in-delay-2">
          <button 
            onClick={() => setAuthView('register')}
            className="bg-primary hover:bg-green-800 transition-colors text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-primary/30 w-full sm:w-auto">
            بدا دابا
          </button>
          <a onClick={(e) => { e.preventDefault(); setAuthView('login'); }} className="cursor-pointer font-bold text-majorelle-blue dark:text-sandy-beige hover:text-primary dark:hover:text-tifinagh-turquoise transition-colors" href="#">
            دخل للحساب ديالك <span className="material-symbols-outlined align-middle">arrow_back</span>
          </a>
        </div>
      </header>
      
      <main>
        <section className="max-w-4xl mx-auto mb-20 fade-in fade-in-delay-3">
          <PublicChat />
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="flag"
            title="دير أهداف"
            description="حط الأهداف المالية ديالك ولحساب صابون يعاونك بخطة باش توصل ليهم."
            delay="fade-in-delay-4"
            iconBg="bg-majorelle-blue/10 dark:bg-majorelle-blue/30"
            iconColor="text-majorelle-blue dark:text-blue-300"
          />
          <FeatureCard
            icon="bar_chart"
            title="تقارير واعرة"
            description="شوف التقارير اليومية، الشهرية والسنوية باش تعرف فين كتمشي فلوسك."
            delay="fade-in-delay-5"
            iconBg="bg-brand-gold/10 dark:bg-brand-gold/30"
            iconColor="text-brand-gold dark:text-yellow-300"
          />
          <FeatureCard
            icon="account_balance_wallet"
            title="تبع الفلوس"
            description="دخل الدخل والمصاريف ديالك بالدارجة، وخلي لحساب صابون يجمع ليك كلشي."
            delay="fade-in-delay-6"
            iconBg="bg-primary/10 dark:bg-primary/20"
            iconColor="text-primary dark:text-green-300"
          />
        </section>
      </main>
      
      <footer className="text-center mt-20">
        <p className="text-slate-600 dark:text-slate-500 text-sm">
          صنع بحب في المغرب 🇲🇦
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
