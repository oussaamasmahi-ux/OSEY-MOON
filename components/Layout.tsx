
import React from 'react';
import { AppConfig, UserState } from '../types';
import { LogOut, ShieldCheck, User, Stethoscope, Star, Facebook, Youtube, MessageCircle, Send as TelegramIcon, Sun, Moon } from 'lucide-react';

// Using default React import to ensure JSX intrinsic elements (header, div, main, footer, etc.) are correctly recognized in this environment
interface LayoutProps {
  children: React.ReactNode;
  config: AppConfig;
  user: UserState | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, config, user, onLogout, theme, onToggleTheme }) => {
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-emerald-950'}`}>
      {/* Floating Social Media Bar */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col gap-4">
        {config.socialLinks?.facebook && (
          <a href={config.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 glass-green rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-xl hover:-translate-x-2">
            <Facebook className="w-6 h-6" />
          </a>
        )}
        {config.socialLinks?.telegram && (
          <a href={config.socialLinks.telegram} target="_blank" rel="noreferrer" className="w-12 h-12 glass-green rounded-2xl flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-xl hover:-translate-x-2">
            <TelegramIcon className="w-6 h-6" />
          </a>
        )}
        {config.socialLinks?.youtube && (
          <a href={config.socialLinks.youtube} target="_blank" rel="noreferrer" className="w-12 h-12 glass-green rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl hover:-translate-x-2">
            <Youtube className="w-6 h-6" />
          </a>
        )}
        {config.socialLinks?.whatsapp && (
          <a href={config.socialLinks.whatsapp} target="_blank" rel="noreferrer" className="w-12 h-12 glass-green rounded-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-xl hover:-translate-x-2">
            <MessageCircle className="w-6 h-6" />
          </a>
        )}
      </div>

      <header className={`glass-green sticky top-0 z-50 px-4 py-3 border-b shadow-lg transition-all duration-500 ${user?.role === 'admin' ? 'border-amber-400/30' : 'border-emerald-500/10'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
            <div className="relative">
              <div className={`absolute inset-0 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full ${user?.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
              <img 
                src={config.logo} 
                alt="Logo" 
                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl object-contain bg-white/10 p-1 border shadow-inner transition-colors ${user?.role === 'admin' ? 'border-amber-400/40' : 'border-white/20'}`} 
              />
            </div>
            <div className="flex flex-col">
              <h1 className={`text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-l bg-clip-text text-transparent uppercase ${theme === 'dark' ? 'from-emerald-300 via-white to-emerald-300' : 'from-emerald-800 via-emerald-600 to-emerald-800'}`}>
                {config.platformName}
              </h1>
              <div className="flex items-center gap-1.5 -mt-1">
                <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-emerald-300/60' : 'text-emerald-800/60'}`}>Veterinary Platform</span>
                {user?.role === 'admin' && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={onToggleTheme}
              className={`p-2.5 rounded-2xl transition-all border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20'}`}
              title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user && (
              <>
                <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border text-sm font-medium transition-colors ${user.role === 'admin' ? 'border-amber-400/20' : 'border-emerald-500/10'}`}>
                  {user.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Stethoscope className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className={user.role === 'admin' ? 'text-amber-200' : (theme === 'dark' ? 'text-emerald-100' : 'text-emerald-800')}>
                    {user.role === 'admin' ? 'مدير المنصة' : 'طالب بيطري'}
                  </span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2.5 hover:bg-red-500/20 rounded-2xl transition-all text-red-500 border border-transparent hover:border-red-500/30 active:scale-90"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        {children}
      </main>

      <footer className={`py-12 px-4 border-t mt-12 backdrop-blur-md transition-colors ${theme === 'dark' ? 'border-white/5 bg-black/10' : 'border-emerald-500/10 bg-white/50'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-right">
             <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                <img src={config.logo} alt="" className="w-8 h-8 opacity-50" />
                <span className={`text-lg font-bold ${theme === 'dark' ? 'text-emerald-300/80' : 'text-emerald-800'}`}>{config.platformName}</span>
             </div>
             <p className={`text-sm max-w-sm ${theme === 'dark' ? 'text-emerald-300/40' : 'text-emerald-800/60'}`}>
                المنصة التعليمية الأولى المتخصصة في الطب البيطري وعلوم الحيوان. نهدف لتوفير أفضل المصادر العلمية للطلاب والباحثين.
             </p>
          </div>
          <div className={`text-center md:text-left text-xs ${theme === 'dark' ? 'text-emerald-300/60' : 'text-emerald-800/60'}`}>
            <div className="flex lg:hidden justify-center gap-4 mb-6">
              {config.socialLinks?.facebook && <a href={config.socialLinks.facebook} className="p-2 bg-white/10 rounded-lg"><Facebook className="w-5 h-5" /></a>}
              {config.socialLinks?.telegram && <a href={config.socialLinks.telegram} className="p-2 bg-white/10 rounded-lg"><TelegramIcon className="w-5 h-5" /></a>}
              {config.socialLinks?.youtube && <a href={config.socialLinks.youtube} className="p-2 bg-white/10 rounded-lg"><Youtube className="w-5 h-5" /></a>}
              {config.socialLinks?.whatsapp && <a href={config.socialLinks.whatsapp} className="p-2 bg-white/10 rounded-lg"><MessageCircle className="w-5 h-5" /></a>}
            </div>
            <p>© {new Date().getFullYear()} {config.platformName.toUpperCase()} ACADEMY</p>
            <p className="mt-2">جميع المحتويات العلمية محمية بحقوق النشر</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
