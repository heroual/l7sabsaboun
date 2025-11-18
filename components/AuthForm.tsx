import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../services/firebase';
import { PaperAirplaneIcon } from './icons';

interface AuthFormProps {
  mode: 'login' | 'register';
  setAuthView: (view: 'landing' | 'login' | 'register') => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, setAuthView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const title = mode === 'login' ? 'مرحبا بك مرة أخرى!' : 'مرحبا بالمستخدم الجديد!';
  const buttonText = mode === 'login' ? 'دخول' : 'تسجل';
  const switchText = mode === 'login' ? 'ماعندكش حساب؟ تسجل دابا.' : 'عندك حساب ديجا؟ دخل.';

  const handleSwitchMode = () => {
    setAuthView(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError('وقع شي خطأ. تأكد من المعلومات أو عاود حاول.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-transparent bg-clip-text">
            لحساب صابون
          </h1>
          <p className="text-slate-600 mt-2">{title}</p>
        </div>
        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-slate-700">كلمة السر</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-teal-500 text-white rounded-full py-3 font-semibold hover:bg-teal-600 disabled:bg-slate-300 transition-all duration-200 transform hover:scale-105 active:scale-95">
            {isLoading ? 'كيتسنى...' : buttonText}
            {!isLoading && <PaperAirplaneIcon className="h-5 w-5" />}
          </button>
        </form>
        <div className="text-center">
          <button onClick={handleSwitchMode} className="text-sm text-teal-600 hover:underline">
            {switchText}
          </button>
        </div>
         <div className="text-center">
            <button onClick={() => setAuthView('landing')} className="text-sm text-slate-500 hover:underline">
                رجع للصفحة الرئيسية ←
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;