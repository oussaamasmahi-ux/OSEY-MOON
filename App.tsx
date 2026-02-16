
// Fix: Use default import for React to resolve JSX intrinsic element type errors
import React, { useState, useEffect } from 'react';
import { UserState, ContentItem, AccessToken, AppConfig } from './types';
import { storage } from './services/storage';
import { INITIAL_CONFIG, INITIAL_CONTENT, ADMIN_SECRET } from './constants';
import { Login } from './views/Login';
import { AdminDashboard } from './views/AdminDashboard';
import { StudentDashboard } from './views/StudentDashboard';
import { Layout } from './components/Layout';
import { VetChat } from './components/VetChat';
import { Settings, Eye, AlertTriangle, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserState | null>(() => storage.getUser());
  const [content, setContent] = useState<ContentItem[]>(() => storage.getContent());
  const [tokens, setTokens] = useState<AccessToken[]>(() => storage.getTokens());
  const [config, setConfig] = useState<AppConfig>(() => storage.getConfig() || INITIAL_CONFIG);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as any) || 'dark');

  useEffect(() => {
    if (content.length === 0 && storage.getContent().length === 0) {
      storage.saveContent(INITIAL_CONTENT);
      setContent(INITIAL_CONTENT);
    }
  }, [content]);

  useEffect(() => {
    document.body.className = theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogin = (inputCode: string) => {
    const code = inputCode.trim();
    
    // الأولوية لرمز الأدمن الرئيسي "ADMIN123" أو الرمز المخزن
    const isMasterAdmin = code === ADMIN_SECRET;
    const isStoredAdmin = config.adminSecret && code === config.adminSecret.trim();

    if (isMasterAdmin || isStoredAdmin) {
      const adminUser: UserState = { role: 'admin' };
      setUser(adminUser);
      storage.setUser(adminUser);
      setIsAdminMode(false);
      return true;
    }

    // التحقق من رموز الطلاب
    const tokenIndex = tokens.findIndex(t => 
      t.code === code && 
      t.expiryDate > Date.now() && 
      !t.isUsed
    );

    if (tokenIndex !== -1) {
      const foundToken = tokens[tokenIndex];
      const studentUser: UserState = { 
        role: 'student', 
        token: foundToken.code, 
        expiry: foundToken.expiryDate 
      } as any;
      
      const newTokens = [...tokens];
      newTokens[tokenIndex] = { ...foundToken, isUsed: true };
      setTokens(newTokens);
      storage.saveTokens(newTokens);
      
      setUser(studentUser);
      storage.setUser(studentUser);
      return true;
    }

    return false;
  };

  const handleLogout = () => {
    setUser(null);
    storage.clearUser();
    setIsAdminMode(false);
  };

  const updateContent = (newContent: ContentItem[]) => {
    setContent(newContent);
    storage.saveContent(newContent);
  };

  const updateTokens = (newTokens: AccessToken[]) => {
    setTokens(newTokens);
    storage.saveTokens(newTokens);
  };

  const updateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    storage.saveConfig(newConfig);
  };

  // حساب وقت انتهاء الصلاحية للطلاب
  const isExpiringSoon = user?.role === 'student' && user.expiry 
    ? (user.expiry - Date.now()) < (3 * 24 * 60 * 60 * 1000) && (user.expiry - Date.now()) > 0
    : false;

  const daysLeft = user?.expiry ? Math.ceil((user.expiry - Date.now()) / (24 * 60 * 60 * 1000)) : 0;

  return (
    <Layout config={config} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {/* بنر تنبيه انتهاء الاشتراك للطلاب */}
          {isExpiringSoon && !isAdminMode && (
            <div className="mb-6 animate-in slide-in-from-top duration-500">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 glass">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-500 text-sm sm:text-base">تنبيه انتهاء الاشتراك</h4>
                    <p className="text-xs dark:text-amber-200/60 text-amber-800/60">ينتهي اشتراكك خلال {daysLeft} {daysLeft === 1 ? 'يوم' : 'أيام'}. يرجى تجديد الرمز لضمان استمرار الوصول.</p>
                  </div>
                </div>
                {config.socialLinks?.whatsapp && (
                  <a 
                    href={config.socialLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95 whitespace-nowrap"
                  >
                    <Clock className="w-4 h-4" />
                    تجديد الاشتراك الآن
                  </a>
                )}
              </div>
            </div>
          )}

          {user.role === 'admin' && (
            <div className="fixed top-24 left-4 md:left-6 z-[100] flex flex-col gap-2">
              <button 
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-2 px-4 py-3 md:px-5 md:py-3 rounded-2xl font-bold shadow-2xl transition-all border-2 ${isAdminMode ? 'bg-white text-emerald-600 border-white' : 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600'} text-xs md:text-sm`}
              >
                {isAdminMode ? (
                  <><Eye className="w-4 h-4 md:w-5 md:h-5" /> عرض الواجهة</>
                ) : (
                  <><Settings className="w-4 h-4 md:w-5 md:h-5" /> لوحة التحكم</>
                )}
              </button>
            </div>
          )}

          {user.role === 'admin' && isAdminMode ? (
            <AdminDashboard 
              content={content} 
              setContent={updateContent} 
              tokens={tokens} 
              setTokens={updateTokens}
              config={config}
              setConfig={updateConfig}
            />
          ) : (
            <>
              <StudentDashboard content={content} user={user} />
              <VetChat />
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
