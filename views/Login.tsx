
// Fix: Use default import for React to resolve JSX intrinsic element type errors
import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { KeyRound, Lock, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (code: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // تحسين: مسح المسافات الزائدة قبل التحقق من الرمز
    if (onLogin(code.trim())) {
      setError(false);
    } else {
      setError(true);
      // اهتزاز بسيط للتنبيه على الخطأ
      if (window.navigator.vibrate) window.navigator.vibrate(100);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <GlassCard className="text-center shadow-2xl relative overflow-hidden border border-emerald-500/20">
          {/* خلفية جمالية متحركة خلف الأيقونة */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full"></div>
          
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Lock className="w-10 h-10 text-emerald-400" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black mb-2 dark:text-white text-emerald-950">مرحباً بك مجدداً</h2>
          <p className="text-sm dark:text-emerald-200/60 text-emerald-800/60 mb-8">أدخل رمز الوصول الخاص بك للمتابعة إلى مكتبة osey vet</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5 group-focus-within:scale-110 transition-transform" />
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError(false);
                }}
                autoComplete="off"
                spellCheck="false"
                placeholder="أدخل رمز الدخول..."
                className="w-full bg-black/10 dark:bg-white/5 border border-emerald-500/20 rounded-2xl py-4 pr-12 pl-4 dark:text-white text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-center tracking-[0.2em] font-mono text-lg"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>الرمز غير صحيح! تأكد من كتابة الرمز بشكل دقيق</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95 text-lg"
            >
              دخول المنصة
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-[10px] dark:text-emerald-300/40 text-emerald-800/40 uppercase font-bold tracking-widest">
            <p>للحصول على رمز وصول جديد، يرجى التواصل مع إدارة osey vet</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};