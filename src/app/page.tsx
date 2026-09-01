'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import {
  Sparkles,
  Video,
  QrCode,
  Tv,
  Smartphone,
  ShieldCheck,
  Play,
  Heart,
  ArrowRight,
  CheckCircle2,
  Users,
  Flame,
  LayoutDashboard,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'record' | 'moderate' | 'wall'>('wall');

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-zinc-950" style={{ backgroundColor: "#090a0f", color: "#f3f4f6" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Background glow meshes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-amber-500/20 via-rose-500/15 to-indigo-500/20 rounded-full filter blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-amber-400 text-xs font-bold tracking-wide shadow-xl backdrop-blur-xl animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Next-Gen Event Video Guestbook & Live Wall</span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
              Collect <span className="gold-gradient-text">Video Wishes</span> from Guests & Stream Them <span className="neon-gradient-text">Live on Big Screens</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Empower event hosts to create custom celebrations, generate instant table QR codes, record mobile video greetings from attendees, and moderate wishes in real-time.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-base shadow-2xl shadow-amber-500/30 transition-all transform hover:scale-[1.03]"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Host Sign In & Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/e/demo-wedding-2026/wall"
              target="_blank"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-base border border-white/15 backdrop-blur-md transition-all hover:scale-[1.02]"
            >
              <Tv className="w-5 h-5 text-cyan-400" />
              <span>Launch Live Wall Demo</span>
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Google OAuth & Multi-Tenancy</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Dual QR Code Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mobile In-Browser MediaRecorder Studio</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Venue TV Slideshow</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Platform Demo Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                How It Works
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                The Complete Event Ecosystem
              </h2>
            </div>

            {/* Step Switcher */}
            <div className="grid grid-cols-3 p-1.5 bg-black/60 rounded-2xl border border-white/10 gap-1">
              <button
                onClick={() => setActiveTab('record')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'record'
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                1. Guest Recording
              </button>
              <button
                onClick={() => setActiveTab('moderate')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'moderate'
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                2. Host Moderation
              </button>
              <button
                onClick={() => setActiveTab('wall')}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'wall'
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                3. Venue Live Wall
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content info */}
            <div className="lg:col-span-5 space-y-5">
              {activeTab === 'record' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Frictionless In-Browser Mobile Recording
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Guests scan the printed table QR code with their phone camera. No app download or account creation required! They record a 15-45s video greeting with live audio visualization, preview it, and submit with their name.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/e/demo-wedding-2026/record"
                      target="_blank"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      <span>Try Guest Recording Studio</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'moderate' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Private Host Moderation Console
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    All incoming guest videos land in a private "Pending Review" queue. Hosts or event coordinators can preview submissions, approve them to broadcast live on the venue wall, reject unwanted clips, or batch approve all with one click.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/dashboard/events/demo-wedding-2026"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400 transition-colors"
                    >
                      <span>Open Host Moderation Demo</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'wall' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Tv className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Cinematic Venue Projector Live Wall
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Hook up your laptop to the venue projector or big screen TV. The Live Wall auto-syncs approved wishes in real-time with smooth video transitions, lower-third guest names, sound controls, and a corner QR code for guests to scan.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/e/demo-wedding-2026/wall"
                      target="_blank"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-zinc-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
                    >
                      <span>Launch Fullscreen Wall</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Visual Preview Mockup */}
            <div className="lg:col-span-7 bg-[#0b0d14] rounded-2xl border border-white/10 p-4 shadow-2xl relative overflow-hidden">
              <div className="aspect-[16/10] rounded-xl overflow-hidden relative bg-black flex items-center justify-center">
                {activeTab === 'record' && (
                  <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#111320] to-black">
                    <div className="w-20 h-28 rounded-2xl border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center p-2 mb-3 bg-black/40">
                      <Smartphone className="w-6 h-6 text-amber-400 mb-1" />
                      <span className="text-[9px] text-zinc-300">Camera Live</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Guest Recording Preview
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      MediaRecorder API with 3-2-1 countdown, live audio meter, and instant review
                    </p>
                  </div>
                )}

                {activeTab === 'moderate' && (
                  <div className="w-full h-full p-4 flex flex-col justify-between bg-[#0e101a]">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                      <span className="font-bold text-white">Pending Moderation Queue</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                        1 Pending
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 my-auto">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">Jessica Miller</span>
                          <span className="text-[9px] text-emerald-400 font-bold">Approved</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 italic">"Wishing you both endless love!"</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">Grandma Eleanor</span>
                          <span className="text-[9px] text-amber-400 font-bold">Pending</span>
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <span className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px]">
                            Approve
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                            Reject
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'wall' && (
                  <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-happy-friends-holding-sparklers-at-a-party-41370-large.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                    <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-emerald-400 font-bold border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Live Sync Active</span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 max-w-xs text-left">
                      <span className="text-xs font-bold text-white block">
                        David & Emily Chen
                      </span>
                      <span className="text-[10px] text-zinc-300 italic block">
                        "So honored to celebrate with you guys tonight!"
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 p-1.5 bg-white rounded-lg shadow-lg">
                      <QRCodeSVG value="http://localhost:3000" size={42} level="L" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for Weddings, Galas, Birthdays & Corporate Events
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Everything you need to deliver an unforgettable interactive guest experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Dual QR Code System</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generates two distinct QR codes automatically: a mobile recording link for table cards and a live wall link for venue projectors.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Host Video Moderation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ensure only approved, high-quality video messages appear on the big screen with instant review and bulk approval tools.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Venue Projector Modes</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Switch effortlessly between an automated TV carousel slideshow and an interactive masonry grid with full audio controls.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#07080c] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">EventWishes</span>
            <span>• Interactive Video Guestbook</span>
          </div>
          <p>© 2026 EventWishes. Production-ready event platform.</p>
        </div>
      </footer>
    </div>
  );
}
