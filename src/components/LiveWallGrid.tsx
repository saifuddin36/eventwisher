'use client';

import React, { useState } from 'react';
import { Play, User, Heart, Sparkles, MessageSquare, X, Maximize2, Volume2, VolumeX, Clock } from 'lucide-react';
import { VideoWish, EventItem } from '@/types';
import { QRCodeSVG } from 'qrcode.react';

interface LiveWallGridProps {
  event: EventItem;
  wishes: VideoWish[];
}

export function LiveWallGrid({ event, wishes }: LiveWallGridProps) {
  const [selectedWish, setSelectedWish] = useState<VideoWish | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const recordUrl = `${baseUrl}/e/${event.id}/record`;

  const filteredWishes = wishes.filter(
    (w) =>
      w.guestName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (w.message && w.message.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="w-full space-y-6">
      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Feed Active
            </span>
          </div>
          <span className="text-xs text-zinc-500">•</span>
          <span className="text-xs text-zinc-300 font-medium">
            <span className="text-amber-400 font-bold">{wishes.length}</span> Video Wishes Received
          </span>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by guest name or message..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full px-3.5 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Wishes Grid */}
      {filteredWishes.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Waiting for Video Wishes</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
            Scan the QR code on the screen with your smartphone to record the first video greeting for this celebration!
          </p>

          <div className="inline-block p-4 bg-white rounded-2xl shadow-xl border border-white/20">
            <QRCodeSVG value={recordUrl} size={150} level="M" />
            <p className="text-[11px] font-bold text-zinc-900 mt-2">Scan with Camera</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredWishes.map((wish) => (
            <div
              key={wish.id}
              onClick={() => setSelectedWish(wish)}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-[#0e1017] transition-all duration-300 hover:scale-[1.03] hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10"
            >
              {/* Video Thumbnail / Preview */}
              <video
                src={wish.videoUrl}
                preload="metadata"
                className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              {/* Play Button Indicator */}
              <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-amber-500/90 group-hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                  <Play className="w-5 h-5 fill-zinc-950 ml-0.5" />
                </div>
              </div>

              {/* Top Details */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                  <Heart className="w-2.5 h-2.5 inline mr-1 fill-amber-400 text-amber-400" /> Wish
                </span>
                {wish.duration && (
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-zinc-300">
                    {Math.round(wish.duration)}s
                  </span>
                )}
              </div>

              {/* Bottom Details */}
              <div className="absolute bottom-3 left-3 right-3 space-y-1">
                <div className="flex items-center gap-1.5 text-white font-bold text-sm truncate">
                  <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{wish.guestName}</span>
                </div>
                {wish.message && (
                  <p className="text-[11px] text-zinc-300 line-clamp-1 italic">
                    "{wish.message}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Playback Modal */}
      {selectedWish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0e1017] rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setSelectedWish(null)}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Player */}
            <div className="relative aspect-[9/16] max-h-[70vh] bg-black">
              <video
                src={selectedWish.videoUrl}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Info */}
            <div className="p-5 bg-gradient-to-b from-[#0e1017] to-[#08090d] border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedWish.guestName}</h3>
                    <p className="text-[10px] text-zinc-400">
                      {new Date(selectedWish.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                  <Heart className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Approved Wish</span>
                </div>
              </div>

              {selectedWish.message && (
                <p className="text-sm text-zinc-200 italic bg-white/[0.03] p-3 rounded-xl border border-white/5">
                  "{selectedWish.message}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
