'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, Maximize, Minimize, User, Heart, Sparkles } from 'lucide-react';
import { VideoWish, EventItem } from '@/types';
import { QRCodeSVG } from 'qrcode.react';

interface LiveWallSlideshowProps {
  event: EventItem;
  wishes: VideoWish[];
}

export function LiveWallSlideshow({ event, wishes }: LiveWallSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentWish = wishes[currentIndex] || null;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const recordUrl = `${baseUrl}/e/${event.id}/record`;

  const nextWish = () => {
    if (wishes.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % wishes.length);
    setProgress(0);
  };

  const prevWish = () => {
    if (wishes.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + wishes.length) % wishes.length);
    setProgress(0);
  };

  // Video time update for progress bar
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  // When video ends, automatically play next
  const handleVideoEnded = () => {
    nextWish();
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Auto play new video on index change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn('Autoplay prevented:', e);
        setIsMuted(true);
      });
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextWish();
      if (e.key === 'ArrowLeft') prevWish();
      if (e.key === ' ') {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      }
      if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wishes.length]);

  if (wishes.length === 0) {
    return (
      <div className="w-full aspect-[16/9] min-h-[500px] flex flex-col items-center justify-center rounded-3xl bg-[#090a0f] border border-white/10 p-8 text-center">
        <Sparkles className="w-12 h-12 text-amber-400 animate-pulse mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No Approved Wishes Yet</h3>
        <p className="text-zinc-400 max-w-md text-sm mb-6">
          Guests can scan the QR code to record video greetings, which will automatically show here once approved!
        </p>
        <div className="p-4 bg-white rounded-2xl shadow-xl">
          <QRCodeSVG value={recordUrl} size={180} level="M" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[82vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center group select-none"
    >
      {/* Blurred Ambient Glow Background */}
      {currentWish && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-125 pointer-events-none transition-all duration-700"
          style={{ backgroundImage: `url(${currentWish.videoUrl})` }}
        />
      )}

      {/* Main Video Stream Player */}
      {currentWish && (
        <video
          ref={videoRef}
          key={currentWish.id}
          src={currentWish.videoUrl}
          autoPlay
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          className="relative z-10 max-h-full max-w-full object-contain rounded-xl shadow-2xl"
        />
      )}

      {/* Progress Bar at Top */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-white/10 z-30">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Left/Right Carousel Nav Arrows */}
      <button
        onClick={prevWish}
        className="absolute left-6 z-30 p-3 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
        title="Previous wish (Left Arrow)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextWish}
        className="absolute right-6 z-30 p-3 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
        title="Next wish (Right Arrow)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Lower Third Cinematic Banner */}
      {currentWish && (
        <div className="absolute bottom-6 left-6 z-30 max-w-lg bg-[#090a0f]/90 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-6 duration-500">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-zinc-950 flex items-center justify-center font-bold text-sm shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">{currentWish.guestName}</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  <Heart className="w-2.5 h-2.5 inline fill-amber-400 mr-1" /> Wish #{currentIndex + 1} of {wishes.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {new Date(currentWish.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {currentWish.message && (
            <p className="text-xs text-zinc-200 italic line-clamp-2 bg-white/5 p-2 rounded-lg border border-white/5">
              "{currentWish.message}"
            </p>
          )}
        </div>
      )}

      {/* Right Corner Scan-to-Wish Overlay Card */}
      <div className="absolute bottom-6 right-6 z-30 hidden md:flex items-center gap-3 p-3 rounded-2xl bg-[#090a0f]/85 backdrop-blur-xl border border-white/15 shadow-2xl">
        <div className="p-2 bg-white rounded-xl shadow-md">
          <QRCodeSVG value={recordUrl} size={68} level="M" />
        </div>
        <div className="text-left pr-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
            Join the Live Wall
          </span>
          <span className="text-xs font-bold text-white block">
            Scan to Send Video Wish
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">
            Record from your smartphone
          </span>
        </div>
      </div>

      {/* Top Floating Controls (Sound & Fullscreen) */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2.5">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold backdrop-blur-md border shadow-lg transition-all ${
            isMuted
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Unmute Sound</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Sound On</span>
            </>
          )}
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white/80 hover:text-white border border-white/10 hover:bg-black/90 transition-colors"
          title="Toggle Fullscreen (F)"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
