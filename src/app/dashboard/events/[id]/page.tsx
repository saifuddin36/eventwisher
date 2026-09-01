'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { VideoModerationCard } from '@/components/VideoModerationCard';
import { QRCodeModal } from '@/components/QRCodeModal';
import { PrintableFlyer } from '@/components/PrintableFlyer';
import { EventItem, VideoWish, WishStatus } from '@/types';
import {
  Sparkles,
  QrCode,
  Tv,
  ArrowLeft,
  CheckCheck,
  XCircle,
  Filter,
  RefreshCw,
  Printer,
  Calendar,
  User,
  Heart,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';

export default function EventModerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [wishes, setWishes] = useState<VideoWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | WishStatus>('pending');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  // Fetch Event & Wishes
  const fetchData = async () => {
    try {
      setLoading(true);
      const eventRes = await fetch(`/api/events/${id}`);
      if (!eventRes.ok) {
        throw new Error('Event not found');
      }
      const eventData = await eventRes.json();
      setEvent(eventData.event);

      const wishesRes = await fetch(`/api/events/${id}/wishes`);
      if (wishesRes.ok) {
        const wishesData = await wishesRes.json();
        setWishes(wishesData.wishes || []);
      }
    } catch (err) {
      console.error('Failed to load event data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, id]);

  // Update single wish status
  const handleUpdateWishStatus = async (wishId: string, newStatus: WishStatus) => {
    try {
      const res = await fetch(`/api/events/${id}/wishes/${wishId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setWishes((prev) =>
          prev.map((w) => (w.id === wishId ? data.wish : w))
        );
      }
    } catch (err) {
      console.error('Failed to update wish:', err);
    }
  };

  // Delete single wish
  const handleDeleteWish = async (wishId: string) => {
    try {
      const res = await fetch(`/api/events/${id}/wishes/${wishId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWishes((prev) => prev.filter((w) => w.id !== wishId));
      }
    } catch (err) {
      console.error('Failed to delete wish:', err);
    }
  };

  // Batch Update Wishes
  const handleBatchUpdate = async (newStatus: WishStatus) => {
    const pendingIds = wishes.filter((w) => w.status === 'pending').map((w) => w.id);
    if (pendingIds.length === 0) return;

    if (!confirm(`Are you sure you want to mark all ${pendingIds.length} pending wishes as ${newStatus}?`)) {
      return;
    }

    try {
      setBatchLoading(true);
      const res = await fetch(`/api/events/${id}/wishes/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishIds: pendingIds, status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setWishes(data.wishes);
      }
    } catch (err) {
      console.error('Batch update failed:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-zinc-400">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mr-2" /> Loading event console...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center text-white space-y-4">
        <h2 className="text-xl font-bold">Event not found</h2>
        <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const pendingCount = wishes.filter((w) => w.status === 'pending').length;
  const approvedCount = wishes.filter((w) => w.status === 'approved').length;
  const rejectedCount = wishes.filter((w) => w.status === 'rejected').length;

  const filteredWishes = wishes.filter((w) => {
    if (activeFilter === 'all') return true;
    return w.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Breadcrumb & Action bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {event.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  Host Moderation
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {new Date(event.date).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span>Host: {event.hostEmail}</span>
              </div>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <QrCode className="w-4 h-4" />
              <span>Event QR Codes</span>
            </button>

            <button
              onClick={() => setIsPrintOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Table Stand Flyer</span>
            </button>

            <Link
              href={`/e/${event.id}/wall`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-colors"
            >
              <Tv className="w-4 h-4" />
              <span>Open Live Wall</span>
            </Link>

            <Link
              href={`/e/${event.id}/record`}
              target="_blank"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-xs border border-white/10 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Test Recording</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs & Batch Moderation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1">
            <button
              onClick={() => setActiveFilter('pending')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'pending'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Pending Review</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeFilter === 'pending' ? 'bg-zinc-950 text-amber-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('approved')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'approved'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Approved (Live)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeFilter === 'approved' ? 'bg-zinc-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('rejected')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'rejected'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Rejected</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeFilter === 'rejected' ? 'bg-black text-rose-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {rejectedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>All Wishes ({wishes.length})</span>
            </button>
          </div>

          {/* Batch Actions for Pending Items */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-2">
              <button
                disabled={batchLoading}
                onClick={() => handleBatchUpdate('approved')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Approve All Pending ({pendingCount})</span>
              </button>

              <button
                disabled={batchLoading}
                onClick={() => handleBatchUpdate('rejected')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject All</span>
              </button>
            </div>
          )}
        </div>

        {/* Wishes Grid or Empty State */}
        {filteredWishes.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              No {activeFilter !== 'all' ? activeFilter : ''} video wishes
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
              Share your guest QR code or test recording a video greeting to populate the moderation queue.
            </p>
            <button
              onClick={() => setIsQrOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg transition-all"
            >
              Get Event QR Codes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredWishes.map((wish) => (
              <VideoModerationCard
                key={wish.id}
                wish={wish}
                onUpdateStatus={handleUpdateWishStatus}
                onDelete={handleDeleteWish}
              />
            ))}
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        event={event}
        onOpenPrintFlyer={() => {
          setIsQrOpen(false);
          setIsPrintOpen(true);
        }}
      />

      {/* Printable Flyer */}
      <PrintableFlyer
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        event={event}
      />
    </div>
  );
}
