
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, Send, X, Bot, User, Loader2, Sparkles, AlertCircle, Key } from 'lucide-react';
import { VET_AI_INSTRUCTION } from '../constants';

export const VetChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, isError?: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const handleOpenAiKeySelector = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // نفترض النجاح بعد النقر لبدء المحادثة
        setMessages([]); 
      }
    } catch (err) {
      console.error("Key selection failed:", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const currentHistory = [...messages.filter(m => !m.isError)];
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // التحقق من وجود مفتاح API قبل الطلب
      if (!process.env.API_KEY) {
        throw new Error("MISSING_API_KEY");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // استخدام موديل فلاش لايت لسرعة الاستجابة القصوى
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash-lite-latest', 
        config: {
          systemInstruction: VET_AI_INSTRUCTION,
          temperature: 0.7,
        },
        history: currentHistory.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessage({ message: userMsg });
      const aiText = result.text || "عذراً، لم أتمكن من الحصول على إجابة.";
      
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
      let isKeyError = false;

      if (error.message === "MISSING_API_KEY" || error.message?.includes("403") || error.message?.includes("API_KEY") || error.message?.includes("not found")) {
        errorMsg = "محرك الذكاء الاصطناعي غير نشط. يرجى الضغط على الزر أدناه لتنشيط الخدمة.";
        isKeyError = true;
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg, isError: isKeyError }]);
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
                {!process.env.API_KEY && (
                  <button 
                    onClick={handleOpenAiKeySelector}
                    className="mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 mx-auto shadow-lg"
                  >
                    <Key className="w-4 h-4" />
                    تفعيل محرك osey AI
                  </button>
                )}
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl flex flex-col gap-2 ${msg.role === 'user' ? 'bg-white/10 text-white rounded-br-none' : (msg.isError ? 'bg-amber-500/20 border border-amber-500/30 text-amber-200' : 'bg-emerald-500 text-white rounded-bl-none shadow-md shadow-emerald-900/20')}`}>
                  <div className="flex gap-3">
                    <div className="shrink-0 pt-1">
                      {msg.role === 'user' ? <User className="w-4 h-4 opacity-50" /> : (msg.isError ? <AlertCircle className="w-4 h-4 text-amber-400" /> : <Bot className="w-4 h-4" />)}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.isError && (
                    <button 
                      onClick={handleOpenAiKeySelector}
                      className="mt-2 w-full py-2 bg-amber-500 hover:bg-amber-400 text-white text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Key className="w-3 h-3" />
                      إعداد مفتاح الـ API الآن
                    </button>
                  )}
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
