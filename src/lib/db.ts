import fs from 'node:fs';
import path from 'node:path';
import { EventItem, VideoWish, User, CreateEventInput, WishStatus } from '@/types';
import { nanoid } from 'nanoid';
import { getSupabaseServer } from './supabase';

interface DatabaseSchema {
  users: User[];
  events: EventItem[];
  wishes: VideoWish[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist for local fallback
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Initial demo seed data for local fallback
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
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch {}
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading local database:', err);
    return initialData;
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    ensureDirs();
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (e) {
    console.error('Local db write failed:', e);
  }
}

// Helpers to map Supabase database rows to TypeScript interfaces
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbEvent(row: any): EventItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    date: row.date,
    hostEmail: row.host_email,
    description: row.description || '',
    theme: row.theme || 'gold',
    maxDurationSec: row.max_duration_sec || 45,
    coverImage: row.cover_image,
    allowFileUpload: row.allow_file_upload ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbWish(row: any): VideoWish {
  return {
    id: row.id,
    eventId: row.event_id,
    guestName: row.guest_name,
    message: row.message || '',
    videoUrl: row.video_url,
    duration: row.duration || 15,
    fileSize: row.file_size ? Number(row.file_size) : undefined,
    mimeType: row.mime_type,
    status: row.status as WishStatus,
    createdAt: row.created_at,
    moderatedAt: row.moderated_at,
  };
}

export const db = {
  // ===================== EVENTS =====================
  getEventsByHost: async (hostEmail: string): Promise<EventItem[]> => {
    const supabase = getSupabaseServer();
    if (supabase) {
      const normalizedEmail = hostEmail.toLowerCase();
      let query = supabase.from('events').select('*').order('created_at', { ascending: false });
      if (normalizedEmail !== 'admin@eventwishes.com') {
        query = query.ilike('host_email', normalizedEmail);
      }
      const { data: events, error } = await query;
      if (error) {
        console.error('Supabase getEventsByHost error:', error);
        return [];
      }
      const { data: wishes } = await supabase.from('wishes').select('id, event_id, status');
      const allWishes = wishes || [];

      return (events || []).map((event) => {
        const eventWishes = allWishes.filter((w) => w.event_id === event.id);
        return {
          ...mapDbEvent(event),
          totalWishes: eventWishes.length,
          pendingWishes: eventWishes.filter((w) => w.status === 'pending').length,
          approvedWishes: eventWishes.filter((w) => w.status === 'approved').length,
          rejectedWishes: eventWishes.filter((w) => w.status === 'rejected').length,
        };
      });
    }

    // Local JSON Fallback
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

  getAllEvents: async (): Promise<EventItem[]> => {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getAllEvents error:', error);
        return [];
      }
      const { data: wishes } = await supabase.from('wishes').select('id, event_id, status');
      const allWishes = wishes || [];

      return (events || []).map((event) => {
        const eventWishes = allWishes.filter((w) => w.event_id === event.id);
        return {
          ...mapDbEvent(event),
          totalWishes: eventWishes.length,
          pendingWishes: eventWishes.filter((w) => w.status === 'pending').length,
          approvedWishes: eventWishes.filter((w) => w.status === 'approved').length,
          rejectedWishes: eventWishes.filter((w) => w.status === 'rejected').length,
        };
      });
    }

    // Local Fallback
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

  getEventById: async (idOrSlug: string): Promise<EventItem | null> => {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .maybeSingle();

      if (error || !event) return null;

      const { data: wishes } = await supabase
        .from('wishes')
        .select('id, status')
        .eq('event_id', event.id);

      const eventWishes = wishes || [];
      return {
        ...mapDbEvent(event),
        totalWishes: eventWishes.length,
        pendingWishes: eventWishes.filter((w) => w.status === 'pending').length,
        approvedWishes: eventWishes.filter((w) => w.status === 'approved').length,
        rejectedWishes: eventWishes.filter((w) => w.status === 'rejected').length,
      };
    }

    // Local Fallback
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

  createEvent: async (input: CreateEventInput): Promise<EventItem> => {
    const id = `evt-${nanoid(8)}`;
    const slug =
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || id;

    const supabase = getSupabaseServer();
    if (supabase) {
      const row = {
        id,
        slug,
        name: input.name,
        date: input.date,
        host_email: input.hostEmail.toLowerCase(),
        description: input.description || '',
        theme: input.theme || 'gold',
        max_duration_sec: input.maxDurationSec || 45,
        allow_file_upload: true,
      };

      const { data, error } = await supabase.from('events').insert(row).select().single();
      if (error) {
        console.error('Supabase createEvent error:', error);
        throw error;
      }

      return {
        ...mapDbEvent(data),
        totalWishes: 0,
        pendingWishes: 0,
        approvedWishes: 0,
        rejectedWishes: 0,
      };
    }

    // Local Fallback
    const data = readDb();
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

  updateEvent: async (id: string, updates: Partial<EventItem>): Promise<EventItem | null> => {
    const supabase = getSupabaseServer();
    if (supabase) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
      if (updates.maxDurationSec !== undefined) dbUpdates.max_duration_sec = updates.maxDurationSec;
      if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;
      if (updates.allowFileUpload !== undefined) dbUpdates.allow_file_upload = updates.allowFileUpload;

      const { error } = await supabase.from('events').update(dbUpdates).eq('id', id);
      if (error) {
        console.error('Supabase updateEvent error:', error);
        return null;
      }
      return await db.getEventById(id);
    }

    // Local Fallback
    const data = readDb();
    const index = data.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    data.events[index] = {
      ...data.events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDb(data);
    return await db.getEventById(id);
  },

  deleteEvent: async (id: string): Promise<boolean> => {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteEvent error:', error);
        return false;
      }
      return true;
    }

    // Local Fallback
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

  // ===================== WISHES =====================
  getWishesByEvent: async (eventId: string, status?: WishStatus): Promise<VideoWish[]> => {
    const supabase = getSupabaseServer();
    if (supabase) {
      let query = supabase
        .from('wishes')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: wishes, error } = await query;
      if (error) {
        console.error('Supabase getWishesByEvent error:', error);
        return [];
      }
      return (wishes || []).map(mapDbWish);
    }

    // Local Fallback
    const data = readDb();
    let wishes = data.wishes.filter((w) => w.eventId === eventId);
    if (status) {
      wishes = wishes.filter((w) => w.status === status);
    }
    return wishes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getApprovedWishes: async (eventId: string): Promise<VideoWish[]> => {
    return await db.getWishesByEvent(eventId, 'approved');
  },

  createWish: async (wishData: {
    eventId: string;
    guestName: string;
    message?: string;
    videoUrl: string;
    duration?: number;
    fileSize?: number;
    mimeType?: string;
  }): Promise<VideoWish> => {
    const id = `wish-${nanoid(10)}`;
    const guestName = wishData.guestName.trim() || 'Anonymous Guest';
    const message = wishData.message?.trim() || '';
    const duration = wishData.duration || 15;

    const supabase = getSupabaseServer();
    if (supabase) {
      const row = {
        id,
        event_id: wishData.eventId,
        guest_name: guestName,
        message,
        video_url: wishData.videoUrl,
        duration,
        file_size: wishData.fileSize || null,
        mime_type: wishData.mimeType || null,
        status: 'pending',
      };

      const { data, error } = await supabase.from('wishes').insert(row).select().single();
      if (error) {
        console.error('Supabase createWish error:', error);
        throw error;
      }
      return mapDbWish(data);
    }

    // Local Fallback
    const data = readDb();
    const newWish: VideoWish = {
      id,
      eventId: wishData.eventId,
      guestName,
      message,
      videoUrl: wishData.videoUrl,
      duration,
      fileSize: wishData.fileSize,
      mimeType: wishData.mimeType,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    data.wishes.unshift(newWish);
    writeDb(data);
    return newWish;
  },

  updateWishStatus: async (wishId: string, status: WishStatus): Promise<VideoWish | null> => {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from('wishes')
        .update({
          status,
          moderated_at: new Date().toISOString(),
        })
        .eq('id', wishId)
        .select()
        .maybeSingle();

      if (error || !data) {
        console.error('Supabase updateWishStatus error:', error);
        return null;
      }
      return mapDbWish(data);
    }

    // Local Fallback
    const data = readDb();
    const wish = data.wishes.find((w) => w.id === wishId);
    if (!wish) return null;

    wish.status = status;
    wish.moderatedAt = new Date().toISOString();
    writeDb(data);
    return wish;
  },

  bulkUpdateWishStatus: async (wishIds: string[], status: WishStatus): Promise<number> => {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from('wishes')
        .update({
          status,
          moderated_at: new Date().toISOString(),
        })
        .in('id', wishIds)
        .select();

      if (error) {
        console.error('Supabase bulkUpdateWishStatus error:', error);
        return 0;
      }
      return data?.length || 0;
    }

    // Local Fallback
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

  deleteWish: async (wishId: string): Promise<boolean> => {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.from('wishes').delete().eq('id', wishId);
      if (error) {
        console.error('Supabase deleteWish error:', error);
        return false;
      }
      return true;
    }

    // Local Fallback
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
