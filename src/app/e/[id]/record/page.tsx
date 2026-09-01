'use client';

import React, { useState, useEffect, use } from 'react';
import { VideoRecorder } from '@/components/VideoRecorder';
import { EventItem } from '@/types';
import { Sparkles, Video, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function GuestRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          throw new Error('Event not found or link is expired');
        }
        const data = await res.json();
        setEvent(data.event);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center p-4 text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-xs text-zinc-400">Loading guest video booth...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center p-6 text-white text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
          <Video className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Event Not Found</h2>
        <p className="text-xs text-zinc-400 max-w-sm">
          {error || 'This event link may have been updated or removed by the host.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Go to EventWishes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Mini top brand indicator */}
      <div className="w-full flex items-center justify-between max-w-md mx-auto mb-3">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
            <Video className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold tracking-tight">EventWishes</span>
        </Link>

        <Link
          href={`/e/${event.id}/wall`}
          target="_blank"
          className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          View Live Wall →
        </Link>
      </div>

      {/* Main Video Studio */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto">
        <VideoRecorder event={event} />
      </div>

      {/* Footer disclaimer */}
      <footer className="text-center text-[10px] text-zinc-500 mt-6 max-w-xs mx-auto">
        Powered by EventWishes • All guest greetings are reviewed by host before public broadcast.
      </footer>
    </div>
  );
}
