
import React from 'react';
import { UserState, ContentItem, AccessToken, AppConfig } from './types';
import { storage } from './services/storage';
import { INITIAL_CONFIG, INITIAL_CONTENT, ADMIN_SECRET } from './constants';
import { Login } from './views/Login';
import { AdminDashboard } from './views/AdminDashboard';
import { StudentDashboard } from './views/StudentDashboard';
import { Layout } from './components/Layout';
import { VetChat } from './components/VetChat';
import { Settings, Eye } from 'lucide-react';

// Standardized React import to resolve JSX intrinsic element errors
const App: React.FC = () => {
  const [user, setUser] = React.useState<UserState | null>(storage.getUser());
  const [content, setContent] = React.useState<ContentItem[]>(storage.getContent());
  const [tokens, setTokens] = React.useState<AccessToken[]>(storage.getTokens());
  const [config, setConfig] = React.useState<AppConfig>(storage.getConfig() || INITIAL_CONFIG);
  const [isAdminMode, setIsAdminMode] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>(localStorage.getItem('theme') as any || 'dark');

  React.useEffect(() => {
    if (content.length === 0 && storage.getContent().length === 0) {
      storage.saveContent(INITIAL_CONTENT);
      setContent(INITIAL_CONTENT);
    }
    
    // تطبيق السمة على الـ body
    document.body.className = theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (code: string) => {
    if (code === ADMIN_SECRET) {
      const adminUser: UserState = { role: 'admin' };
      setUser(adminUser);
      storage.setUser(adminUser);
      setIsAdminMode(false);
      return true;
    }

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
      };
      
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

  return (
    <Layout config={config} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme}>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {user.role === 'admin' && (
            <div className="fixed top-24 left-6 z-[100] flex flex-col gap-2">
              <button 
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold shadow-2xl transition-all border-2 ${isAdminMode ? 'bg-white text-emerald-600 border-white' : 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600'}`}
              >
                {isAdminMode ? (
                  <><Eye className="w-5 h-5" /> عرض الواجهة الرسمية</>
                ) : (
                  <><Settings className="w-5 h-5" /> دخول لوحة التحكم</>
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
