
import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { ContentItem, AccessToken, AppConfig, ContentType, TokenDuration, Attachment } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Plus, Trash2, Key, BookOpen, Settings, Facebook, Youtube, MessageCircle, Send as TelegramIcon, Upload, Loader2, X, Files, ChevronDown, Save, Globe } from 'lucide-react';
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'image' | 'pdf'>('image');

  const [newContent, setNewContent] = useState<Partial<ContentItem>>({
    title: '', description: '', category: 'lesson', attachments: []
  });

  const handleAddContent = () => {
    if (!newContent.title) return;
    const item: ContentItem = {
      id: Math.random().toString(36).substring(2, 11),
      title: newContent.title || '',
      description: newContent.description || '',
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple
        onChange={handleFileChange} 
      />

      <nav className="flex gap-4 p-1.5 glass-green rounded-2xl w-fit mx-auto border border-white/10 shadow-xl overflow-x-auto max-w-full">
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold whitespace-nowrap ${activeTab === 'content' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-emerald-300/60 hover:bg-white/5'}`}
        >
          <BookOpen className="w-5 h-5" /> المحتوى
        </button>
        <button 
          onClick={() => setActiveTab('tokens')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold whitespace-nowrap ${activeTab === 'tokens' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-emerald-300/60 hover:bg-white/5'}`}
        >
          <Key className="w-5 h-5" /> الرموز
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold whitespace-nowrap ${activeTab === 'settings' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-emerald-300/60 hover:bg-white/5'}`}
        >
          <Settings className="w-5 h-5" /> الإعدادات
        </button>
      </nav>

      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <GlassCard className="border-t-4 border-t-emerald-500">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-400">
                <Plus className="w-6 h-6" /> إضافة درس جديد
              </h3>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="عنوان الدرس أو الاختبار"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white"
                  value={newContent.title || ''}
                  onChange={e => setNewContent({...newContent, title: e.target.value})}
                />
                <textarea 
                  placeholder="وصف المحتوى..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none text-white"
                  value={newContent.description || ''}
                  onChange={e => setNewContent({...newContent, description: e.target.value})}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group col-span-2">
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer text-white"
                      value={newContent.category}
                      onChange={e => setNewContent({...newContent, category: e.target.value as ContentType})}
                    >
                      <option value="lesson" className="bg-emerald-950">درس علمي</option>
                      <option value="summary" className="bg-emerald-950">ملخص شامل</option>
                      <option value="exam" className="bg-emerald-950">امتحان تجريبي</option>
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                  </div>

                  <button onClick={() => triggerFileSelect('image')} className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/10 transition-all">
                    <Upload className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-bold text-white">صور</span>
                  </button>
                  <button onClick={() => triggerFileSelect('pdf')} className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/10 transition-all">
                    <Upload className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-bold text-white">PDF</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {newContent.attachments?.map((att) => (
                    <div key={att.id} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-white truncate">{att.name}</span>
                      <button onClick={() => removeAttachment(att.id)} className="text-red-400 p-1"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleAddContent}
                  disabled={!newContent.title || isUploading}
                  className="w-full bg-emerald-500 py-4 rounded-2xl font-black text-white shadow-xl hover:bg-emerald-600 transition-all"
                >
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'نشر المحتوى الآن'}
                </button>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-7 space-y-4">
             {content.map(item => (
                <GlassCard key={item.id} className="flex justify-between items-center py-4">
                  <div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">{item.category}</span>
                  </div>
                  <button onClick={() => setContent(content.filter(c => c.id !== item.id))} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                </GlassCard>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <GlassCard className="text-center p-10">
            <h3 className="text-2xl font-black mb-8 text-white">توليد اشتراكات الطلاب</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(['week', 'halfMonth', 'month'] as TokenDuration[]).map(dur => (
                <button key={dur} onClick={() => generateToken(dur)} className="p-6 border border-emerald-500/20 rounded-2xl bg-black/20 hover:bg-emerald-500/10 text-white font-bold transition-all">
                  {DURATION_LABELS[dur]}
                </button>
              ))}
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token, i) => (
              <GlassCard key={i} className={`flex justify-between items-center ${token.isUsed ? 'opacity-50 grayscale' : 'border-emerald-500/40'}`}>
                <span className="font-mono font-black text-emerald-400">{token.code}</span>
                <span className="text-[10px] text-white/40">{DURATION_LABELS[token.duration]}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <GlassCard className="border-t-4 border-t-emerald-500">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2 text-white">
              <Globe className="w-6 h-6 text-emerald-400" />
              إعدادات المنصة والهوية
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-emerald-400 mb-3 uppercase tracking-widest">اسم المنصة</label>
                <input 
                  type="text" 
                  value={config.platformName}
                  onChange={e => setConfig({...config, platformName: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="col-span-full">
                   <h4 className="text-sm font-black text-emerald-400 mb-4 flex items-center gap-2">
                     <Save className="w-4 h-4" /> روابط التواصل الاجتماعي
                   </h4>
                </div>
                
                <div className="relative">
                  <Facebook className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <input 
                    type="text" 
                    placeholder="رابط فيسبوك"
                    value={config.socialLinks?.facebook || ''}
                    onChange={e => updateSocialLink('facebook', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white text-sm"
                  />
                </div>

                <div className="relative">
                  <TelegramIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400" />
                  <input 
                    type="text" 
                    placeholder="رابط تليجرام"
                    value={config.socialLinks?.telegram || ''}
                    onChange={e => updateSocialLink('telegram', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white text-sm"
                  />
                </div>

                <div className="relative">
                  <Youtube className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input 
                    type="text" 
                    placeholder="رابط يوتيوب"
                    value={config.socialLinks?.youtube || ''}
                    onChange={e => updateSocialLink('youtube', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white text-sm"
                  />
                </div>

                <div className="relative">
                  <MessageCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                  <input 
                    type="text" 
                    placeholder="رابط واتساب"
                    value={config.socialLinks?.whatsapp || ''}
                    onChange={e => updateSocialLink('whatsapp', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5 mt-8">
                <span className="text-emerald-300/60 text-xs font-bold">تأكد من حفظ الإعدادات لتطبيقها فوراً</span>
                <button 
                  onClick={handleSaveSettings}
                  className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white font-black shadow-xl transition-all flex items-center gap-2"
                >
                  {saveSuccess ? 'تم الحفظ بنجاح!' : <><Save className="w-5 h-5" /> حفظ التغييرات</>}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
