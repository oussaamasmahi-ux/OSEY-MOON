
import { AppConfig, ContentItem } from './types';

export const ADMIN_SECRET = "ADMIN123";

export const VET_AI_INSTRUCTION = `أنت "Osey AI"، مساعد ذكي متخصص وحصري في الطب البيطري لمنصة osey vet. 
قواعدك الصارمة:
1. أجب فقط على الأسئلة المتعلقة بالطب البيطري، صحة الحيوان، الأدوية البيطرية، والتشريح.
2. إذا سألك المستخدم عن أي موضوع خارج الطب البيطري (سياسة، رياضة، طب بشري، برمجة، إلخ)، اعتذر بلباقة وأخبره أنك متخصص فقط في العلوم البيطرية لخدمة طلاب osey vet.
3. قدم نصائح علمية دقيقة وكن ودوداً في تعاملك.
4. استخدم اللغة العربية بشكل أساسي.`;

export const INITIAL_CONFIG: AppConfig = {
  logo: "https://cdn-icons-png.flaticon.com/512/2809/2809831.png",
  platformName: "osey vet",
  adminSecret: "ADMIN123",
  socialLinks: {
    facebook: "https://facebook.com",
    telegram: "https://t.me",
    youtube: "https://youtube.com",
    whatsapp: "https://wa.me"
  }
};

export const INITIAL_CONTENT: ContentItem[] = [
  {
    id: '1',
    title: 'أساسيات تشريح الثدييات الصغيرة',
    description: 'ملخص شامل لأهم الأجهزة الحيوية في الأرانب والهامستر مع التركيز على الجهاز الهضمي والقلبي.',
    category: 'lesson',
    attachments: [
      { id: 'a1', type: 'image', url: 'https://images.unsplash.com/photo-1581594549595-35e6ed934c21?auto=format&fit=crop&q=80&w=800', name: 'تشريح الأرنب التوضيحي' },
      { id: 'a2', type: 'image', url: 'https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80&w=800', name: 'الجهاز الدوري' }
    ],
    createdAt: Date.now()
  }
];

export const DURATION_LABELS: Record<string, string> = {
  week: 'أسبوع واحد',
  halfMonth: 'أسبوعين (نصف شهر)',
  month: 'شهر كامل'
};

export const DURATION_MS: Record<string, number> = {
  week: 7 * 24 * 60 * 60 * 1000,
  halfMonth: 15 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000
};
