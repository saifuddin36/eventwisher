'use client';

import React, { useState, useEffect, use } from 'react';
import { LiveWallGrid } from '@/components/LiveWallGrid';
import { LiveWallSlideshow } from '@/components/LiveWallSlideshow';
import { EventItem, VideoWish } from '@/types';
import {
  Sparkles,
  Tv,
  LayoutGrid,
  Maximize2,
  RefreshCw,
  QrCode,
  Heart,
  Video,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

export default function PublicLiveWallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [wishes, setWishes] = useState<VideoWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'slideshow' | 'grid'>('slideshow');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const recordUrl = `${baseUrl}/e/${id}/record`;

  // Fetch approved wishes
  const fetchApprovedWishes = async () => {
    try {
      const res = await fetch(`/api/events/${id}/wishes?status=approved`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        setWishes(data.wishes || []);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error('Failed to sync live wall:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load + Real-time auto-polling every 4 seconds
  useEffect(() => {
    fetchApprovedWishes();
    const interval = setInterval(fetchApprovedWishes, 4000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-[#07080c] flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-10 h-10 animate-spin text-amber-400 mb-4" />
        <h2 className="text-xl font-bold">Connecting to Live Wall...</h2>
        <p className="text-xs text-zinc-400 mt-1">Syncing venue video feed</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#07080c] flex flex-col items-center justify-center p-6 text-white text-center">
        <h2 className="text-2xl font-black mb-2">Live Wall Unavailable</h2>
        <p className="text-xs text-zinc-400 mb-6">Could not find event or live wall feed.</p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs">
          Return to EventWishes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Venue Ambient Backdrop Glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-rose-500/10 rounded-full filter blur-[150px] pointer-events-none" />

      {/* Top Venue Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07080c]/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Left Event Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-[1.5px] shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#0d0e15] rounded-[9px] flex items-center justify-center">
              <Video className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate max-w-md">
              {event.name}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-bold uppercase tracking-wider">
                  Live Wall
                </span>
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{wishes.length} Approved Wishes</span>
            </div>
          </div>
        </div>

        {/* Right Mode Toggle & QR launcher */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-black/60 border border-white/10 rounded-xl">
            <button
              onClick={() => setViewMode('slideshow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'slideshow'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Cinematic TV Projector Slideshow"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TV Showcase</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Interactive Masonry Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid View</span>
            </button>
          </div>

          {/* Quick QR popover button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-colors"
            title="Show Guest Recording QR Code"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Scan to Wish</span>
          </button>
        </div>
      </header>

      {/* Main Wall Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-6 relative z-10">
        {viewMode === 'slideshow' ? (
          <LiveWallSlideshow event={event} wishes={wishes} />
        ) : (
          <LiveWallGrid event={event} wishes={wishes} />
        )}
      </main>

      {/* Floating Bottom Bar */}
      <footer className="px-6 py-3 border-t border-white/[0.06] bg-[#07080c]/90 backdrop-blur-md flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Real-time sync active (Last updated: {lastSyncTime.toLocaleTimeString()})</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/e/${event.id}/record`}
            target="_blank"
            className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <Smartphone className="w-3 h-3" /> Record a greeting
          </Link>
          <span>•</span>
          <span>EventWishes Venue Display System</span>
        </div>
      </footer>

      {/* QR Code Modal for Venue Big Screen */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0f111a] border border-white/15 rounded-3xl p-6 text-center text-white shadow-2xl flex flex-col items-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Scan to Join Live Wall
            </div>

            <h3 className="text-lg font-black">{event.name}</h3>

            <div className="p-4 bg-white rounded-2xl shadow-xl">
              <QRCodeSVG value={recordUrl} size={200} level="H" />
            </div>

            <p className="text-xs text-zinc-400">
              Point your smartphone camera at this QR code to record and submit a video greeting!
            </p>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
            >
              Close Overlay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
