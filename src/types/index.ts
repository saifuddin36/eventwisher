export type WishStatus = 'pending' | 'approved' | 'rejected';

export type EventTheme = 'gold' | 'neon' | 'rose' | 'sapphire' | 'emerald';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  slug: string;
  name: string;
  date: string;
  hostEmail: string;
  description?: string;
  theme?: EventTheme;
  maxDurationSec?: number;
  coverImage?: string;
  allowFileUpload?: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed stats
  totalWishes?: number;
  pendingWishes?: number;
  approvedWishes?: number;
  rejectedWishes?: number;
}

export interface VideoWish {
  id: string;
  eventId: string;
  guestName: string;
  message?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
  status: WishStatus;
  createdAt: string;
  moderatedAt?: string;
}

export interface CreateEventInput {
  name: string;
  date: string;
  hostEmail: string;
  description?: string;
  theme?: EventTheme;
  maxDurationSec?: number;
}

export interface CreateWishInput {
  eventId: string;
  guestName: string;
  message?: string;
  videoBlob?: Blob;
}
