
import * as React from 'react';
import { ContentItem, AccessToken, AppConfig, ContentType, TokenDuration, Attachment } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Plus, Trash2, Key, BookOpen, Settings, Layout, Image as ImageIcon, FileText, Hash, Check, Facebook, Youtube, MessageCircle, Send as TelegramIcon, UserCheck, Timer, Upload, Loader2, X, Files, ChevronDown } from 'lucide-react';
import { DURATION_LABELS, DURATION_MS } from '../constants';

// Using * as React to ensure JSX intrinsic elements (div, nav, button, select, input, etc.) are correctly recognized in this environment
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
  const [activeTab, setActiveTab] = React.useState<'content' | 'tokens' | 'settings'>('content');
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = React.useState<'image' | 'pdf'>('image');

  const [newContent, setNewContent] = React.useState<Partial<ContentItem>>({
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        reader.onerror = () => resolve(); // Skip failed files
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

  const handleSaveConfig = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const updateSocialLink = (platform: 'facebook' | 'telegram' | 'youtube' | 'whatsapp', value: string) => {
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
              <h3 className="text-xl font-bold mb-6 flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-2">
                  <Plus className="w-6 h-6" /> إضافة درس جديد
                </div>
              </h3>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="عنوان الدرس أو الاختبار"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white placeholder:text-white/20"
                  value={newContent.title || ''}
                  onChange={e => setNewContent({...newContent, title: e.target.value})}
                />
                <textarea 
                  placeholder="وصف المحتوى..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none text-white placeholder:text-white/20"
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

                  <button 
                    onClick={() => triggerFileSelect('image')}
                    disabled={isUploading}
                    className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/10 transition-all hover:border-emerald-500/40"
                  >
                    {isUploading && uploadType === 'image' ? <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /> : <ImageIcon className="w-6 h-6 text-emerald-400" />}
                    <span className="text-xs font-bold text-white">رفع صور (متعدد)</span>
                  </button>
                  <button 
                    onClick={() => triggerFileSelect('pdf')}
                    disabled={isUploading}
                    className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/10 transition-all hover:border-emerald-500/40"
                  >
                    {isUploading && uploadType === 'pdf' ? <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /> : <FileText className="w-6 h-6 text-emerald-400" />}
                    <span className="text-xs font-bold text-white">رفع PDF</span>
                  </button>
                </div>

                <div className="space-y-2 border border-white/5 rounded-2xl p-2 bg-black/20">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[10px] text-emerald-400 font-bold">المرفقات ({newContent.attachments?.length || 0})</span>
                    {newContent.attachments && newContent.attachments.length > 0 && (
                      <button onClick={() => setNewContent({...newContent, attachments: []})} className="text-[9px] text-red-400 hover:underline">حذف الكل</button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto pr-1 scrollbar-hide space-y-2">
                    {newContent.attachments?.map((att) => (
                      <div key={att.id} className="flex items-center justify-between gap-3 bg-white/5 px-3 py-2 rounded-xl border border-white/5 group">
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5 flex items-center justify-center">
                            {att.type === 'image' ? (
                               <img src={att.url} className="w-full h-full object-cover" alt="" />
                            ) : (
                               <FileText className="w-5 h-5 text-emerald-400" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-white/80 truncate max-w-[120px]">{att.name}</span>
                        </div>
                        <button 
                          onClick={() => removeAttachment(att.id)} 
                          className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!newContent.attachments || newContent.attachments.length === 0) && !isUploading && (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-20">
                        <Files className="w-8 h-8" />
                        <p className="text-[10px] font-bold">المرفقات تظهر هنا</p>
                      </div>
                    )}
                    {isUploading && (
                      <div className="py-6 flex flex-col items-center justify-center gap-2 text-emerald-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <p className="text-[10px] font-bold animate-pulse">جاري المعالجة...</p>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleAddContent}
                  disabled={!newContent.title || isUploading}
                  className="w-full bg-emerald-500 py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-950/40 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 text-white flex items-center justify-center gap-3"
                >
                  <Upload className="w-6 h-6" /> نشر الملف الآن
                </button>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xl font-bold px-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                المكتبة المنشورة
              </div>
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {content.length === 0 && (
                <div className="text-center py-32 glass rounded-[3rem] border-dashed border-2 border-white/10 text-emerald-300/20 font-bold">
                  لا يوجد محتوى حالياً
                </div>
              )}
              {content.map(item => (
                <GlassCard key={item.id} className="group !p-5 border-l-4 border-l-emerald-500">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.category === 'lesson' ? 'bg-blue-500/10 text-blue-400' : item.category === 'exam' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {item.category === 'exam' ? <FileText className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-lg text-white truncate">{item.title}</h4>
                        <div className="flex gap-3 mt-1 items-center">
                           <span className="text-[9px] font-black uppercase text-emerald-400">{item.category}</span>
                           <span className="w-1 h-1 rounded-full bg-white/20"></span>
                           <span className="text-[9px] text-emerald-300/40 font-bold">{item.attachments.length} مرفقات</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setContent(content.filter(c => c.id !== item.id))}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <GlassCard className="text-center bg-gradient-to-br from-emerald-500/10 to-transparent p-10">
            <h3 className="text-3xl font-black mb-4 text-white">توليد اشتراكات الطلاب</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              {(['week', 'halfMonth', 'month'] as TokenDuration[]).map(dur => (
                <button 
                  key={dur}
                  onClick={() => generateToken(dur)}
                  className="group flex flex-col items-center gap-4 p-8 border border-emerald-500/20 rounded-[2.5rem] bg-black/20 hover:bg-emerald-500/10 transition-all"
                >
                  <Key className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div className="text-center">
                    <div className="text-xl font-black text-white">{DURATION_LABELS[dur]}</div>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tokens.map((token, i) => (
              <GlassCard key={i} className={`!p-5 border-l-4 ${token.isUsed ? 'border-l-gray-600 bg-black/40' : 'border-l-emerald-500 bg-emerald-500/5'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`font-mono font-black text-xl tracking-widest ${token.isUsed ? 'text-gray-500 line-through' : 'text-emerald-400'}`}>{token.code}</span>
                    <span className="text-[9px] text-white/30 font-bold mt-1">{DURATION_LABELS[token.duration]}</span>
                  </div>
                  <button onClick={() => setTokens(tokens.filter((_, idx) => idx !== i))} className="text-red-400/40 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <GlassCard className="border-t-4 border-t-emerald-500">
            <h3 className="text-2xl font-black mb-10 text-white">إعدادات المنصة</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-emerald-400 mb-3 uppercase">اسم المنصة</label>
                <input 
                  type="text" 
                  value={config.platformName}
                  onChange={e => setConfig({...config, platformName: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white font-black text-xl"
                />
              </div>
              <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5">
                <span className="text-emerald-300/60 font-bold">حفظ جميع التغييرات</span>
                <button 
                  onClick={handleSaveConfig}
                  className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white font-black shadow-xl"
                >
                  {saveSuccess ? 'تم الحفظ!' : 'تطبيق الإعدادات'}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};