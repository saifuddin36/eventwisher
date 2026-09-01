import fs from 'node:fs';
import path from 'node:path';
import { EventItem, VideoWish, User, CreateEventInput, WishStatus } from '@/types';
import { nanoid } from 'nanoid';

interface DatabaseSchema {
  users: User[];
  events: EventItem[];
  wishes: VideoWish[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Initial demo seed data
const initialData: DatabaseSchema = {
  users: [
    {
      id: 'demo-host-1',
      name: 'Sarah & Alex Jenkins',
      email: 'host@eventwishes.com',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'host',
      createdAt: new Date().toISOString(),
    },
  ],
  events: [
    {
      id: 'demo-wedding-2026',
      slug: 'sarah-alex-wedding',
      name: 'Sarah & Alex’s Golden Wedding Gala',
      date: '2026-09-15',
      hostEmail: 'host@eventwishes.com',
      description: 'Join us in capturing unforgettable memories! Leave a heartfelt video wish for Sarah & Alex.',
      theme: 'gold',
      maxDurationSec: 45,
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
      allowFileUpload: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-tech-summit-2026',
      slug: 'global-tech-summit',
      name: 'Global Tech Innovators Summit 2026',
      date: '2026-10-20',
      hostEmail: 'host@eventwishes.com',
      description: 'Share your key takeaways, speaker shout-outs, and future tech wishes for the summit wall!',
      theme: 'neon',
      maxDurationSec: 60,
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
      allowFileUpload: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  wishes: [
    {
      id: 'wish-1',
      eventId: 'demo-wedding-2026',
      guestName: 'Jessica Miller',
      message: 'Wishing you both a lifetime of eternal love, happiness, and unforgettable adventures!',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-her-phone-41487-large.mp4',
      duration: 18,
      status: 'approved',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      moderatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'wish-2',
      eventId: 'demo-wedding-2026',
      guestName: 'David & Emily Chen',
      message: 'So honored to celebrate with you guys tonight! Dance like nobody is watching!',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-happy-friends-holding-sparklers-at-a-party-41370-large.mp4',
      duration: 24,
      status: 'approved',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      moderatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'wish-3',
      eventId: 'demo-wedding-2026',
      guestName: 'Grandma Eleanor',
      message: 'May God bless your sacred bond every single day. Congratulations darling!',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-smiling-at-the-camera-42416-large.mp4',
      duration: 15,
      status: 'pending',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'wish-4',
      eventId: 'demo-tech-summit-2026',
      guestName: 'Marcus Vance (AI Lead)',
      message: 'Mind-blowing keynote on agentic systems! Excited for what we build together.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-talking-to-the-camera-with-earphones-41584-large.mp4',
      duration: 20,
      status: 'approved',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      moderatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    }
  ],
};

function readDb(): DatabaseSchema {
  ensureDirs();
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading database, restoring initial:', err);
    return initialData;
  }
}

function writeDb(data: DatabaseSchema) {
  ensureDirs();
  const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

export const db = {
  // Events
  getEventsByHost: (hostEmail: string): EventItem[] => {
    const data = readDb();
    const normalizedEmail = hostEmail.toLowerCase();
    return data.events
      .filter((e) => e.hostEmail.toLowerCase() === normalizedEmail || normalizedEmail === 'admin@eventwishes.com')
      .map((event) => {
        const wishes = data.wishes.filter((w) => w.eventId === event.id);
        return {
          ...event,
          totalWishes: wishes.length,
          pendingWishes: wishes.filter((w) => w.status === 'pending').length,
          approvedWishes: wishes.filter((w) => w.status === 'approved').length,
          rejectedWishes: wishes.filter((w) => w.status === 'rejected').length,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAllEvents: (): EventItem[] => {
    const data = readDb();
    return data.events.map((event) => {
      const wishes = data.wishes.filter((w) => w.eventId === event.id);
      return {
        ...event,
        totalWishes: wishes.length,
        pendingWishes: wishes.filter((w) => w.status === 'pending').length,
        approvedWishes: wishes.filter((w) => w.status === 'approved').length,
        rejectedWishes: wishes.filter((w) => w.status === 'rejected').length,
      };
    });
  },

  getEventById: (idOrSlug: string): EventItem | null => {
    const data = readDb();
    const event = data.events.find((e) => e.id === idOrSlug || e.slug === idOrSlug);
    if (!event) return null;
    const wishes = data.wishes.filter((w) => w.eventId === event.id);
    return {
      ...event,
      totalWishes: wishes.length,
      pendingWishes: wishes.filter((w) => w.status === 'pending').length,
      approvedWishes: wishes.filter((w) => w.status === 'approved').length,
      rejectedWishes: wishes.filter((w) => w.status === 'rejected').length,
    };
  },

  createEvent: (input: CreateEventInput): EventItem => {
    const data = readDb();
    const id = `evt-${nanoid(8)}`;
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || id;

    const newEvent: EventItem = {
      id,
      slug,
      name: input.name,
      date: input.date,
      hostEmail: input.hostEmail.toLowerCase(),
      description: input.description || '',
      theme: input.theme || 'gold',
      maxDurationSec: input.maxDurationSec || 45,
      allowFileUpload: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.events.unshift(newEvent);
    writeDb(data);
    return {
      ...newEvent,
      totalWishes: 0,
      pendingWishes: 0,
      approvedWishes: 0,
      rejectedWishes: 0,
    };
  },

  updateEvent: (id: string, updates: Partial<EventItem>): EventItem | null => {
    const data = readDb();
    const index = data.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    data.events[index] = {
      ...data.events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(data);
    return db.getEventById(id);
  },

  deleteEvent: (id: string): boolean => {
    const data = readDb();
    const initialCount = data.events.length;
    data.events = data.events.filter((e) => e.id !== id);
    data.wishes = data.wishes.filter((w) => w.eventId !== id);
    if (data.events.length !== initialCount) {
      writeDb(data);
      return true;
    }
    return false;
  },

  // Wishes
  getWishesByEvent: (eventId: string, status?: WishStatus): VideoWish[] => {
    const data = readDb();
    let wishes = data.wishes.filter((w) => w.eventId === eventId);
    if (status) {
      wishes = wishes.filter((w) => w.status === status);
    }
    return wishes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getApprovedWishes: (eventId: string): VideoWish[] => {
    return db.getWishesByEvent(eventId, 'approved');
  },

  createWish: (wishData: {
    eventId: string;
    guestName: string;
    message?: string;
    videoUrl: string;
    duration?: number;
    fileSize?: number;
    mimeType?: string;
  }): VideoWish => {
    const data = readDb();
    const newWish: VideoWish = {
      id: `wish-${nanoid(10)}`,
      eventId: wishData.eventId,
      guestName: wishData.guestName.trim() || 'Anonymous Guest',
      message: wishData.message?.trim() || '',
      videoUrl: wishData.videoUrl,
      duration: wishData.duration || 15,
      fileSize: wishData.fileSize,
      mimeType: wishData.mimeType,
      status: 'pending', // Pending host moderation
      createdAt: new Date().toISOString(),
    };

    data.wishes.unshift(newWish);
    writeDb(data);
    return newWish;
  },

  updateWishStatus: (wishId: string, status: WishStatus): VideoWish | null => {
    const data = readDb();
    const wish = data.wishes.find((w) => w.id === wishId);
    if (!wish) return null;

    wish.status = status;
    wish.moderatedAt = new Date().toISOString();
    writeDb(data);
    return wish;
  },

  bulkUpdateWishStatus: (wishIds: string[], status: WishStatus): number => {
    const data = readDb();
    let count = 0;
    const now = new Date().toISOString();
    data.wishes.forEach((w) => {
      if (wishIds.includes(w.id)) {
        w.status = status;
        w.moderatedAt = now;
        count++;
      }
    });
    if (count > 0) {
      writeDb(data);
    }
    return count;
  },

  deleteWish: (wishId: string): boolean => {
    const data = readDb();
    const initialCount = data.wishes.length;
    data.wishes = data.wishes.filter((w) => w.id !== wishId);
    if (data.wishes.length !== initialCount) {
      writeDb(data);
      return true;
    }
    return false;
  },
};
