
import { ContentItem, AccessToken, AppConfig } from '../types';

const KEYS = {
  CONTENT: 'sci_platform_content',
  TOKENS: 'sci_platform_tokens',
  CONFIG: 'sci_platform_config',
  USER: 'sci_platform_user'
};

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error parsing storage key: ${key}`, e);
    return fallback;
  }
};

const safeSave = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      alert("⚠️ تحذير من osey vet: مساحة تخزين المتصفح ممتلئة! يرجى حذف بعض الدروس القديمة أو تقليل حجم المرفقات لضمان استمرار المنصة في العمل.");
    }
    console.error(`Error saving to storage key: ${key}`, e);
    return false;
  }
};

export const storage = {
  getContent: (): ContentItem[] => safeParse(KEYS.CONTENT, []),
  saveContent: (content: ContentItem[]) => safeSave(KEYS.CONTENT, content),
  
  getTokens: (): AccessToken[] => safeParse(KEYS.TOKENS, []),
  saveTokens: (tokens: AccessToken[]) => safeSave(KEYS.TOKENS, tokens),
  
  getConfig: (): AppConfig | null => safeParse(KEYS.CONFIG, null),
  saveConfig: (config: AppConfig) => safeSave(KEYS.CONFIG, config),
  
  getUser: () => safeParse(KEYS.USER, null),
  setUser: (user: any) => safeSave(KEYS.USER, user),
  clearUser: () => localStorage.removeItem(KEYS.USER)
};
