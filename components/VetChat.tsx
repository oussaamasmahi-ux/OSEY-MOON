
// Fix: Use default import for React to resolve JSX intrinsic element type errors
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { VET_AI_INSTRUCTION } from '../constants';

export const VetChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const currentHistory = [...messages];
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // إنشاء مثيل جديد لضمان استخدام أحدث مفتاح API
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // تشكيل مصفوفة المحتوى مع الحفاظ على الأدوار (user/model)
      const contents = [
        ...currentHistory.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: userMsg }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: contents, // استخدام المصفوفة مباشرة للحفاظ على سياق الحوار
        config: {
          systemInstruction: VET_AI_INSTRUCTION,
          temperature: 0.8,
          // إضافة ميزانية تفكير للموديل Pro لضمان دقة الإجابات البيطرية العلمية
          thinkingConfig: { thinkingBudget: 4000 }
        },
      });

      const aiText = response.text || "عذراً، واجهت مشكلة في صياغة الإجابة.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      let errorMsg = "فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت أو صلاحية مفتاح API.";
      
      if (error instanceof Error && error.message.includes("403")) {
        errorMsg = "عذراً، انتهت حصة الاستخدام المجانية أو المفتاح غير صالح.";
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[1000]">
      {isOpen ? (
        <div className="w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] flex flex-col glass overflow-hidden rounded-3xl border border-emerald-400/30 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-emerald-600 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-none">Osey AI</h3>
                <span className="text-[10px] text-emerald-100 opacity-80 uppercase tracking-widest">مساعد بيطري ذكي</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-emerald-200/60 text-sm px-6 font-bold">مرحباً بك! أنا مساعدك الذكي المتخصص في الطب البيطري. كيف يمكنني مساعدتك اليوم؟</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl flex gap-3 ${msg.role === 'user' ? 'bg-white/10 text-white rounded-br-none' : 'bg-emerald-500 text-white rounded-bl-none shadow-md shadow-emerald-900/20'}`}>
                  <div className="shrink-0 pt-1">
                    {msg.role === 'user' ? <User className="w-4 h-4 opacity-50" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-emerald-500/20 p-3 rounded-2xl rounded-bl-none border border-emerald-500/20">
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white/5 border-t border-white/10">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اسأل سؤالاً بيطرياً..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 outline-none"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-emerald-500 p-2.5 rounded-xl text-white hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-900/40 hover:scale-110 transition-all group border-2 border-white/20"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
};
