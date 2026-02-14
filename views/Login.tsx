
import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { KeyRound, Lock, AlertCircle } from 'lucide-react';

// Using standard default import to ensure JSX intrinsic elements are defined
interface LoginProps {
  onLogin: (code: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(code)) {
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md">
        <GlassCard className="text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-emerald-400" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black mb-2 dark:text-white text-emerald-950">تسجيل الدخول</h2>
          <p className="text-sm dark:text-emerald-200/60 text-emerald-800/60 mb-8">أدخل رمز الوصول الخاص بك للمتابعة</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="أدخل رمز الدخول..."
                className="w-full bg-black/10 dark:bg-white/5 border border-emerald-500/20 rounded-2xl py-4 pr-12 pl-4 dark:text-white text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-center tracking-widest font-mono text-lg"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>الرمز غير صحيح أو تم استخدامه مسبقاً</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95 text-lg"
            >
              دخول المنصة
            </button>
          </form>

          <div className="mt-8 text-xs dark:text-emerald-300/40 text-emerald-800/40">
            <p>للحصول على رمز وصول، يرجى التواصل مع الإدارة</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
