'use client';

import React, { useState, useRef } from 'react';
import { CheckCircle2, XCircle, Trash2, Download, Play, Pause, Clock, User, MessageSquare } from 'lucide-react';
import { VideoWish, WishStatus } from '@/types';

interface VideoModerationCardProps {
  wish: VideoWish;
  onUpdateStatus: (wishId: string, status: WishStatus) => Promise<void>;
  onDelete: (wishId: string) => Promise<void>;
}

export function VideoModerationCard({
  wish,
  onUpdateStatus,
  onDelete,
}: VideoModerationCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStatusChange = async (status: WishStatus) => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(wish.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the video wish from ${wish.guestName}?`)) {
      try {
        setIsUpdating(true);
        await onDelete(wish.id);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const formattedDate = new Date(wish.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusBadge = () => {
    switch (wish.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Approved (Live)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col transition-all duration-200 hover:border-white/20">
      {/* Video Player Container */}
      <div className="relative aspect-[4/5] bg-black group overflow-hidden">
        <video
          ref={videoRef}
          src={wish.videoUrl}
          playsInline
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />

        {/* Status Overlay Badge top-left */}
        <div className="absolute top-3 left-3 z-10">{getStatusBadge()}</div>

        {/* Video duration top-right */}
        {wish.duration && (
          <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-medium text-white/90">
            {Math.round(wish.duration)}s
          </div>
        )}
      </div>

      {/* Details & Actions */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#0d0f17]">
        {/* Guest Info */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-white text-sm truncate">
              <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{wish.guestName}</span>
            </div>
            <span className="text-[11px] text-zinc-400 whitespace-nowrap">{formattedDate}</span>
          </div>

          {wish.message && (
            <p className="mt-2 text-xs text-zinc-300 line-clamp-2 italic bg-white/[0.03] p-2 rounded-lg border border-white/5">
              "{wish.message}"
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          {/* Moderation Status Buttons */}
          <div className="flex items-center gap-1.5">
            {wish.status !== 'approved' && (
              <button
                disabled={isUpdating}
                onClick={() => handleStatusChange('approved')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all shadow-sm disabled:opacity-50"
                title="Approve to show on Live Wall"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
            )}

            {wish.status !== 'rejected' && (
              <button
                disabled={isUpdating}
                onClick={() => handleStatusChange('rejected')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 border border-white/10 transition-all disabled:opacity-50"
                title="Reject wish"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            )}
          </div>

          {/* Download & Delete */}
          <div className="flex items-center gap-1">
            <a
              href={wish.videoUrl}
              download={`wish-${wish.guestName.toLowerCase().replace(/\s+/g, '-')}.mp4`}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Download original video"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              disabled={isUpdating}
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
              title="Delete wish"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
