'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { CreateEventModal } from '@/components/CreateEventModal';
import { QRCodeModal } from '@/components/QRCodeModal';
import { PrintableFlyer } from '@/components/PrintableFlyer';
import { EventItem } from '@/types';
import {
  Sparkles,
  Plus,
  QrCode,
  Tv,
  Film,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Printer,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQrEvent, setSelectedQrEvent] = useState<EventItem | null>(null);
  const [selectedPrintEvent, setSelectedPrintEvent] = useState<EventItem | null>(null);

  // Fetch Host Events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const email = session?.user?.email || 'host@eventwishes.com';
      const res = await fetch(`/api/events?hostEmail=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchEvents();
    }
  }, [status, router]);

  const handleEventCreated = (newEvent: EventItem) => {
    setEvents((prev) => [newEvent, ...prev]);
    setSelectedQrEvent(newEvent); // Automatically show QR codes for newly created event
  };

  const handleDeleteEvent = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this event and all associated video wishes?')) {
      return;
    }
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter(
    (ev) =>
      ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Metrics
  const totalWishes = events.reduce((acc, ev) => acc + (ev.totalWishes || 0), 0);
  const totalPending = events.reduce((acc, ev) => acc + (ev.pendingWishes || 0), 0);
  const totalApproved = events.reduce((acc, ev) => acc + (ev.approvedWishes || 0), 0);

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col">
      <Navbar onOpenCreate={() => setIsCreateOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Stats Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Host Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                Host Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Manage your events, generate table QR codes, and moderate guest video greetings.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Event</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Events
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">{events.length}</div>
            <p className="text-[11px] text-zinc-500">Active celebrations</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Video Wishes
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{totalWishes}</div>
            <p className="text-[11px] text-zinc-500">Submitted by guests</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Pending Review</span>
              {totalPending > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{totalPending}</div>
            <p className="text-[11px] text-zinc-500">Awaiting moderation</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Approved on Wall
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{totalApproved}</div>
            <p className="text-[11px] text-zinc-500">Live on venue screens</p>
          </div>
        </div>

        {/* Search & Events List Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Your Events</span>
              <span className="text-xs text-zinc-400 font-normal">({filteredEvents.length})</span>
            </h2>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-zinc-500 text-sm">
              Loading host events...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No Events Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
                Create your first event to generate guest recording QR codes and launch your venue live wall!
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg transition-all"
              >
                Create Event Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="glass-panel glass-panel-hover rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between"
                >
                  {/* Event Cover Image / Header */}
                  <div className="relative h-40 bg-gradient-to-tr from-[#151724] to-[#202334] overflow-hidden">
                    {event.coverImage ? (
                      <img
                        src={event.coverImage}
                        alt={event.name}
                        className="w-full h-full object-cover brightness-75"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-indigo-500/20">
                        <Film className="w-12 h-12 text-white/20" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17] via-[#0d0f17]/40 to-transparent" />

                    {/* Date Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    {/* QR Code trigger button top-right */}
                    <button
                      onClick={() => setSelectedQrEvent(event)}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg hover:scale-105 transition-transform"
                      title="View & Download QR Codes"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Codes</span>
                    </button>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-[#0d0f17]">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 mb-1">
                        {event.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {event.description || 'Interactive video wish collection event.'}
                      </p>
                    </div>

                    {/* Wish Counts Pill Row */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="block text-[10px] text-zinc-400 font-semibold uppercase">
                          Total
                        </span>
                        <span className="text-sm font-black text-white">{event.totalWishes || 0}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="block text-[10px] text-amber-300 font-semibold uppercase">
                          Pending
                        </span>
                        <span className="text-sm font-black text-amber-400">
                          {event.pendingWishes || 0}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="block text-[10px] text-emerald-300 font-semibold uppercase">
                          Live
                        </span>
                        <span className="text-sm font-black text-emerald-400">
                          {event.approvedWishes || 0}
                        </span>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-colors"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                        <span>Moderate ({event.pendingWishes || 0})</span>
                      </Link>

                      <Link
                        href={`/e/${event.id}/wall`}
                        target="_blank"
                        className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-colors"
                        title="Open Live Wall in new tab"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Wall</span>
                      </Link>

                      <button
                        onClick={(e) => handleDeleteEvent(event.id, e)}
                        className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onEventCreated={handleEventCreated}
        defaultHostEmail={session?.user?.email || 'host@eventwishes.com'}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={!!selectedQrEvent}
        onClose={() => setSelectedQrEvent(null)}
        event={selectedQrEvent}
        onOpenPrintFlyer={(ev) => {
          setSelectedQrEvent(null);
          setSelectedPrintEvent(ev);
        }}
      />

      {/* Table Flyer Print View */}
      <PrintableFlyer
        isOpen={!!selectedPrintEvent}
        onClose={() => setSelectedPrintEvent(null)}
        event={selectedPrintEvent}
      />
    </div>
  );
}
