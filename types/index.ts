export type MessageType = 'sent' | 'received';

// Тип для Firebase Timestamp - включаем FieldValue для serverTimestamp()
import type { FieldValue } from 'firebase/firestore';
export type FirestoreTimestamp = Date | { toDate: () => Date; seconds?: number; nanoseconds?: number } | FieldValue;

export interface Sticker {
  id: string;
  packId: string;
  emoji: string;
  imageUrl: string;
  width: number;
  height: number;
}

export interface StickerPack {
  id: string;
  name: string;
  emoji: string;
  stickers: Sticker[];
}

export interface GifItem {
  id: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
}

export interface Message {
  id: string;
  type: MessageType;
  text: string;
  time: string;
  status?: 'sending' | 'sent' | 'read';
  audioUrl?: string;
  fileUrl?: string;
  fileName?: string;
  senderId?: string;
  createdAt?: FirestoreTimestamp | null;
  chatId?: string;
  editedAt?: FirestoreTimestamp | null;
  replyTo?: { messageId: string; senderName: string; text: string };
  forwardedFrom?: { chatName: string; senderName: string };
  stickerUrl?: string;
  stickerWidth?: number;
  stickerHeight?: number;
  gifUrl?: string;
  gifWidth?: number;
  gifHeight?: number;
  views?: number;
  gift?: {
    id: string;
    name: string;
    emoji: string;
    cost: number;
    from: string;
  };
}

export interface Contact {
  id: string;
  name: string;
  initial: string;
  avatarColor: string;
  avatarUrl?: string;
  statusOnline: string;
  statusOffline: string;
  phone: string;
  bio: string;
  username: string;
  messages: Message[];
  isTyping: boolean;
  unread: number;
  isBlocked?: boolean;
  isBot?: boolean;
  isChannel?: boolean;
  isGroup?: boolean;
  participants?: string[];
  isOfficial?: boolean;
  isFounder?: boolean;
  premium?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdBy: string;
  createdAt: FirestoreTimestamp;
  subscribersCount: number;
  link: string;
  inviteCode: string;
  subscribers: string[];
}

export interface UserProfile {
  name: string;
  username: string;
  bio: string;
  phone: string;
  avatarUrl?: string;
  status?: 'online' | 'offline';
  lastSeen?: FirestoreTimestamp | null;
  isOfficial?: boolean;
  isFounder?: boolean;
  savedStickers?: string[];
  giftsSent?: number;
  giftsReceived?: number;
  premium?: boolean;
  premiumExpiry?: FirestoreTimestamp | null;
}

export type ViewState = 'menu' | 'chat' | 'profile' | 'settings' | 'chat-settings' | 'features' | 'privacy' | 'privacy-settings' | 'notifications' | 'security' | 'admin' | 'info' | 'faq' | 'terms' | 'create-channel' | 'create-group' | 'channel-info' | 'notification-stats' | 'server-status' | 'stars' | 'premium' | 'send-gift' | 'my-gifts' | 'user-gifts' | 'buy-stars' | 'wallet' | 'mini-games' | 'my-stories' | 'news' | 'proxy';
