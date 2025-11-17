import React from 'react';
import { WalletIcon, ChartBarIcon, SparklesIcon } from './icons';
import { PublicChat } from './PublicChat';

interface LandingPageProps {
  setAuthView: (view: 'login' | 'register') => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
    <div className="flex justify-center items-center h-16 w-16 rounded-full bg-teal-100 mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ setAuthView }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#2dd4bf] to-[#06b6d4] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>
        <div className="mx-auto max-w-4xl py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl bg-gradient-to-r from-teal-500 to-cyan-500 text-transparent bg-clip-text">
              لحساب صابون
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              الوكيل المالي ديالك بالدارجة. تبع مصاريفك، دير أهداف، ووصل للأهداف ديالك بطريقة ساهلة ومحفزة.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => setAuthView('register')}
                className="rounded-md bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-transform transform hover:scale-105"
              >
                بدا دابا!
              </button>
              <button onClick={() => setAuthView('login')} className="text-sm font-semibold leading-6 text-gray-900">
                <span aria-hidden="true">←</span> دخل للحساب ديالك
              </button>
            </div>
          </div>
        </div>
        
        <div className="mx-auto max-w-4xl -mt-16 sm:-mt-24 mb-20">
          <PublicChat />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<WalletIcon className="h-8 w-8 text-teal-600" />}
                    title="تبع الفلوس"
                    description="دخل الدخل والمصاريف ديالك بالدارجة، وخلي لحساب صابون يجمع ليك كلشي."
                />
                <FeatureCard 
                    icon={<ChartBarIcon className="h-8 w-8 text-amber-600" />}
                    title="تقارير واعرة"
                    description="شوف التقارير اليومية، الشهرية والسنوية باش تعرف فين كتمشي فلوسك."
                />
                <FeatureCard 
                    icon={<SparklesIcon className="h-8 w-8 text-violet-600" />}
                    title="دير أهداف"
                    description="حط الأهداف المالية ديالك ولحساب صابون يعاونك بخطة باش توصل ليهم."
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;