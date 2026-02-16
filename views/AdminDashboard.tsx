
import React, { useState, useRef, ChangeEvent } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ContentItem, AccessToken, AppConfig, ContentType, TokenDuration, Attachment } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Plus, Trash2, Key, BookOpen, Settings, Facebook, Youtube, MessageCircle, Send as TelegramIcon, Upload, Loader2, X, Files, ChevronDown, Save, Globe, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { DURATION_LABELS, DURATION_MS } from '../constants';

interface AdminDashboardProps {
  content: ContentItem[];
  setContent: (content: ContentItem[]) => void;
  tokens: AccessToken[];
  setTokens: (tokens: AccessToken[]) => void;
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  content, setContent, tokens, setTokens, config, setConfig
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'tokens' | 'settings'>('content');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'image' | 'pdf'>('image');

  const [newContent, setNewContent] = useState<Partial<ContentItem>>({
    title: '', description: '', category: 'lesson', attachments: []
  });

  const handleOpenAiKeySelector = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
      }
    } catch (err) {
      console.error("Error opening key selector:", err);
    }
  };

  const generateAiDescription = async () => {
    if (!newContent.title?.trim()) return;
    setIsAiGenerating(true);
    try {
      if (!process.env.API_KEY) {
        alert("يرجى تفعيل مفتاح الـ API من قسم الإعدادات أولاً.");
        return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite-latest',
        contents: `اكتب وصفاً علمياً جذاباً ومختصراً جداً (15 كلمة) لدرس بيطري بعنوان: "${newContent.title}".`,
      });
      setNewContent(prev => ({ ...prev, description: response.text || '' }));
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("فشل توليد الوصف. تأكد من تفعيل مفتاح الـ API.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAddContent = () => {
    if (!newContent.title?.trim()) return;
    const item: ContentItem = {
      id: Math.random().toString(36).substring(2, 11),
      title: newContent.title.trim(),
      description: newContent.description?.trim() || '',
      category: (newContent.category as ContentType) || 'lesson',
      attachments: newContent.attachments || [],
      createdAt: Date.now()
    };
    setContent([item, ...content]);
    setNewContent({ title: '', description: '', category: 'lesson', attachments: [] });
  };

  const triggerFileSelect = (type: 'image' | 'pdf') => {
    setUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 'application/pdf';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: Attachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 2 * 1024 * 1024) {
        alert(`الملف "${file.name}" كبير جداً.`);
        continue;
      }

      const reader = new FileReader();
      const promise = new Promise<void>((resolve) => {
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          if (base64String) {
            newAttachments.push({ 
              id: Math.random().toString(36).substring(2, 11) + Date.now() + i, 
              type: uploadType, 
              url: base64String, 
              name: file.name 
            });
          }
          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsDataURL(file);
      });
      await promise;
    }

    setNewContent(prev => ({ 
      ...prev, 
      attachments: [...(prev.attachments || []), ...newAttachments] 
    }));
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setNewContent(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(a => a.id !== id)
    }));
  };

  const generateToken = (duration: TokenDuration) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token: AccessToken = {
      code,
      duration,
      createdAt: Date.now(),
      expiryDate: Date.now() + DURATION_MS[duration],
      isUsed: false
    };
    setTokens([token, ...tokens]);
  };

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const updateSocialLink = (platform: keyof NonNullable<AppConfig['socialLinks']>, value: string) => {
    setConfig({
      ...config,
      socialLinks: {
        ...(config.socialLinks || {}),
        [platform]: value
      }
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />

      <nav className="flex gap-2 md:gap-4 p-1.5 glass-green rounded-2xl w-full md:w-fit mx-auto border border-white/10 shadow-xl overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('content')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl transition-all font-bold whitespace-nowrap text-xs md:text-sm ${activeTab === 'content' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-300/60 hover:bg-white/5'}`}>
          <BookOpen className="w-4 h-4 md:w-5 md:h-5" /> المحتوى
        </button>
        <button onClick={() => setActiveTab('tokens')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl transition-all font-bold whitespace-nowrap text-xs md:text-sm ${activeTab === 'tokens' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-300/60 hover:bg-white/5'}`}>
          <Key className="w-4 h-4 md:w-5 md:h-5" /> الرموز
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl transition-all font-bold whitespace-nowrap text-xs md:text-sm ${activeTab === 'settings' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-300/60 hover:bg-white/5'}`}>
          <Settings className="w-4 h-4 md:w-5 md:h-5" /> الإعدادات
        </button>
      </nav>

      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <GlassCard className="border-t-4 border-t-emerald-500">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-400"><Plus className="w-6 h-6" /> إضافة درس جديد</h3>
              <div className="space-y-4">
                <input type="text" placeholder="عنوان الدرس" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white" value={newContent.title || ''} onChange={e => setNewContent({...newContent, title: e.target.value})} />
                <div className="relative">
                  <textarea placeholder="الوصف..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-28 resize-none text-white" value={newContent.description || ''} onChange={e => setNewContent({...newContent, description: e.target.value})} />
                  <button onClick={generateAiDescription} disabled={!newContent.title || isAiGenerating} className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30">
                    {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} توليد وصف ذكي
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative col-span-2">
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 appearance-none text-white" value={newContent.category} onChange={e => setNewContent({...newContent, category: e.target.value as ContentType})}>
                      <option value="lesson">درس علمي</option>
                      <option value="summary">ملخص شامل</option>
                      <option value="exam">امتحان تجريبي</option>
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                  </div>
                  <button onClick={() => triggerFileSelect('image')} className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-emerald-500/20 rounded-2xl text-white"><Upload className="w-5 h-5 text-emerald-400" /><span className="text-[10px] font-bold">صور</span></button>
                  <button onClick={() => triggerFileSelect('pdf')} className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-emerald-500/20 rounded-2xl text-white"><Upload className="w-5 h-5 text-emerald-400" /><span className="text-[10px] font-bold">PDF</span></button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {newContent.attachments?.map((att) => (
                    <div key={att.id} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5"><span className="text-[10px] text-white truncate max-w-[150px]">{att.name}</span><button onClick={() => removeAttachment(att.id)} className="text-red-400 p-1"><X className="w-4 h-4" /></button></div>
                  ))}
                </div>
                <button onClick={handleAddContent} disabled={!newContent.title?.trim() || isUploading} className="w-full bg-emerald-500 py-4 rounded-2xl font-black text-white shadow-xl">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'نشر المحتوى الآن'}
                </button>
              </div>
            </GlassCard>
          </div>
          <div className="lg:col-span-7 space-y-4">
             {content.length === 0 && <div className="text-center py-20 opacity-20 font-bold border-2 border-dashed border-white/20 rounded-3xl">لا يوجد محتوى منشور بعد</div>}
             <div className="grid grid-cols-1 gap-4">
               {content.map(item => (
                  <GlassCard key={item.id} className="flex justify-between items-center py-4 border-l-4 border-l-emerald-500 group">
                    <div className="min-w-0 flex-1"><h4 className="font-bold text-white truncate pr-4">{item.title}</h4><span className="text-[9px] text-emerald-400 font-bold uppercase">{item.category}</span></div>
                    <button onClick={() => setContent(content.filter(c => c.id !== item.id))} className="text-red-400/50 hover:text-red-400 p-2 transition-all"><Trash2 className="w-5 h-5" /></button>
                  </GlassCard>
               ))}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <GlassCard className="text-center p-10 bg-gradient-to-br from-emerald-500/10 to-transparent">
            <h3 className="text-2xl font-black mb-8 text-white uppercase">توليد اشتراكات الطلاب</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(['week', 'halfMonth', 'month'] as TokenDuration[]).map(dur => (
                <button key={dur} onClick={() => generateToken(dur)} className="p-6 border border-emerald-500/20 rounded-2xl bg-black/20 hover:bg-emerald-500/10 text-white font-bold transition-all shadow-lg">{DURATION_LABELS[dur]}</button>
              ))}
            </div>
          </GlassCard>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token, i) => (
              <GlassCard key={i} className={`flex justify-between items-center ${token.isUsed ? 'opacity-40 grayscale' : 'border-emerald-500/40 bg-emerald-500/5'}`}>
                <div className="flex flex-col"><span className="font-mono font-black text-emerald-400 tracking-widest text-lg">{token.code}</span><span className="text-[8px] text-white/30 uppercase">{DURATION_LABELS[token.duration]}</span></div>
                <button onClick={() => setTokens(tokens.filter((_, idx) => idx !== i))} className="text-red-400/30 hover:text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <GlassCard className="border-t-4 border-t-blue-500 bg-blue-500/5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-blue-500/20 p-4 rounded-3xl"><Sparkles className="w-10 h-10 text-blue-400" /></div>
              <div className="flex-1 text-center md:text-right">
                <h3 className="text-lg font-black text-white mb-1 uppercase">تنشيط الذكاء الاصطناعي</h3>
                <p className="text-xs text-blue-200/60 leading-relaxed">لتفعيل ميزات المحادثة ووصف الدروس، يجب ربط مفتاح API الخاص بك. انقر أدناه لاختيار المفتاح.</p>
              </div>
              <button onClick={handleOpenAiKeySelector} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl transition-all flex items-center gap-2">
                <Key className="w-5 h-5" /> تنشيط المحرك الآن
              </button>
            </div>
          </GlassCard>

          <GlassCard className="border-t-4 border-t-emerald-500">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2 text-white"><Globe className="w-6 h-6 text-emerald-400" /> إعدادات المنصة</h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="block text-xs font-black text-emerald-400 uppercase">اسم المنصة الرسمي</label>
                <input type="text" value={config.platformName} onChange={e => setConfig({...config, platformName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white font-black text-xl" />
              </div>
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-2"><Shield className="w-5 h-5" /><h4 className="text-sm font-black uppercase">الأمن</h4></div>
                <input type="text" placeholder="رمز الأدمن المخصص" value={config.adminSecret || ''} onChange={e => setConfig({...config, adminSecret: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-mono tracking-widest" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                <div className="col-span-full"><h4 className="text-sm font-black text-emerald-400 mb-4 flex items-center gap-2 uppercase tracking-widest"><Save className="w-4 h-4" /> التواصل</h4></div>
                <input type="text" placeholder="رابط فيسبوك" value={config.socialLinks?.facebook || ''} onChange={e => updateSocialLink('facebook', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm" />
                <input type="text" placeholder="رابط تليجرام" value={config.socialLinks?.telegram || ''} onChange={e => updateSocialLink('telegram', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm" />
                <input type="text" placeholder="رابط يوتيوب" value={config.socialLinks?.youtube || ''} onChange={e => updateSocialLink('youtube', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm" />
                <input type="text" placeholder="رابط واتساب" value={config.socialLinks?.whatsapp || ''} onChange={e => updateSocialLink('whatsapp', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm" />
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5 mt-8 gap-4">
                <button onClick={handleSaveSettings} className="w-full md:w-fit px-10 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white font-black shadow-xl transition-all flex items-center justify-center gap-2">
                  {saveSuccess ? 'تم الحفظ!' : <><Save className="w-5 h-5" /> حفظ التغييرات</>}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
