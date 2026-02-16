
export type ContentType = 'lesson' | 'summary' | 'exam';

export interface Attachment {
  id: string;
  type: 'image' | 'pdf';
  url: string;
  name: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: ContentType;
  attachments: Attachment[];
  createdAt: number;
}

export type TokenDuration = 'week' | 'halfMonth' | 'month';

export interface AccessToken {
  code: string;
  expiryDate: number;
  duration: TokenDuration;
  createdAt: number;
  isUsed: boolean;
}

export interface SocialLinks {
  facebook?: string;
  telegram?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface AppConfig {
  logo: string;
  platformName: string;
  adminSecret?: string;
  socialLinks?: SocialLinks;
}

export interface UserState {
  role: 'admin' | 'student' | null;
  token?: string;
  expiry?: number;
}
