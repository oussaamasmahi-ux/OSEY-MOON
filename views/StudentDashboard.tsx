
import * as React from 'react';
import { ContentItem, UserState, Attachment } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Search, Image as ImageIcon, FileText, ExternalLink, X, Clock, Eye, Download, ChevronLeft, BookOpen } from 'lucide-react';

// Using * as React to ensure JSX intrinsic elements (div, h2, p, input, button, h3, span, img, a, etc.) are correctly recognized in this environment
interface StudentDashboardProps {
  content: ContentItem[];
  user: UserState;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ content, user }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<ContentItem | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'lesson' | 'summary' | 'exam'>('all');
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const filteredContent = content.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (item.title || '').toLowerCase().includes(searchLower) || (item.description || '').toLowerCase().includes(searchLower);
    const matchesFilter = filter === 'all' || item.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between dark:bg-emerald-950/20 bg-emerald-500/5 p-6 sm:p-8 rounded-[2.5rem] border border-emerald-500/10">
        <div className="text-center md:text-right">
          <h2 className="text-3xl font-black dark:text-white text-emerald-950">مكتبة osey vet</h2>
          <p className="text-xs text-emerald-500/60 font-bold mt-1">المحتوى العلمي متاح طوال فترة اشتراكك</p>
        </div>
        
        <div className="w-full md:w-96 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="ابحث عن درس..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black/5 dark:bg-black/40 border border-emerald-500/20 rounded-2xl py-4 pr-12 pl-4 dark:text-white text-emerald-950 placeholder:text-emerald-500/40"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {(['all', 'lesson', 'summary', 'exam'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2.5 rounded-xl border font-bold text-sm transition-all ${filter === cat ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-black/5 dark:bg-white/5 border-emerald-500/10 dark:text-emerald-200 text-emerald-800'}`}
          >
            {cat === 'all' ? 'الكل' : cat === 'lesson' ? 'دروس' : cat === 'summary' ? 'ملخصات' : 'امتحانات'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <GlassCard key={item.id} onClick={() => setSelectedItem(item)} className="group h-full flex flex-col hover:scale-[1.02] transition-transform">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.category === 'lesson' ? 'bg-blue-500/20 text-blue-500' : item.category === 'exam' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-600'}`}>
              {item.category === 'exam' ? <FileText className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
            </div>
            <h3 className="text-xl font-black mb-2 dark:text-white text-emerald-950">{item.title}</h3>
            <p className="text-sm dark:text-emerald-100/60 text-emerald-800/70 line-clamp-2 mb-6 flex-1">{item.description}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-emerald-500/5">
              <span className="text-[10px] font-bold text-emerald-500 uppercase">{item.category}</span>
              <span className="text-[10px] text-emerald-500/40">{item.attachments.length} ملفات</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden glass rounded-[2rem] flex flex-col border border-emerald-500/20">
            <div className="p-6 border-b border-white/10 flex items-center justify-between dark:bg-black/40 bg-white">
              <h2 className="text-2xl font-black dark:text-white text-emerald-950">{selectedItem.title}</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-emerald-500/10 rounded-full text-emerald-500"><X className="w-8 h-8" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 dark:bg-black/20 bg-white/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {selectedItem.attachments.map(att => (
                  <AttachmentCard 
                    key={att.id} 
                    attachment={att} 
                    onPreview={() => setPreviewImage(att.url)} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" className="max-h-full max-w-full rounded-xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 p-4 bg-white/10 rounded-full text-white"><X className="w-8 h-8" /></button>
        </div>
      )}
    </div>
  );
};

const AttachmentCard: React.FC<{ attachment: Attachment, onPreview: () => void }> = ({ attachment, onPreview }) => {
  return (
    <div className="glass-green p-3 rounded-2xl flex flex-col gap-3 group relative hover:border-emerald-500/50 transition-all">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-black/10 flex items-center justify-center cursor-pointer" onClick={attachment.type === 'image' ? onPreview : undefined}>
        {attachment.type === 'image' ? (
          <img src={attachment.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
        ) : (
          <FileText className="w-10 h-10 text-emerald-500" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold dark:text-white text-emerald-950 truncate">{attachment.name}</span>
        <div className="flex gap-1">
          <a href={attachment.url} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-[9px] font-bold text-center">فتح</a>
          <a href={attachment.url} download={attachment.name} className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><Download className="w-3 h-3" /></a>
        </div>
      </div>
    </div>
  );
};