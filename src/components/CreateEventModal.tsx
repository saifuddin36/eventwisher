'use client';

import React, { useState } from 'react';
import { X, Calendar, Mail, Sparkles, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { EventTheme, EventItem } from '@/types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: EventItem) => void;
  defaultHostEmail?: string;
}

const THEMES: { id: EventTheme; name: string; colorClass: string; borderClass: string; bgGradient: string }[] = [
  {
    id: 'gold',
    name: 'Golden Luxe',
    colorClass: 'text-amber-400',
    borderClass: 'border-amber-500/50 hover:border-amber-400',
    bgGradient: 'from-amber-500/20 to-yellow-600/10',
  },
  {
    id: 'neon',
    name: 'Neon Cyber',
    colorClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/50 hover:border-cyan-400',
    bgGradient: 'from-cyan-500/20 to-blue-600/10',
  },
  {
    id: 'rose',
    name: 'Romantic Rose',
    colorClass: 'text-rose-400',
    borderClass: 'border-rose-500/50 hover:border-rose-400',
    bgGradient: 'from-rose-500/20 to-pink-600/10',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Royal',
    colorClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/50 hover:border-indigo-400',
    bgGradient: 'from-indigo-500/20 to-purple-600/10',
  },
  {
    id: 'emerald',
    name: 'Emerald Gala',
    colorClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/50 hover:border-emerald-400',
    bgGradient: 'from-emerald-500/20 to-teal-600/10',
  },
];

export function CreateEventModal({
  isOpen,
  onClose,
  onEventCreated,
  defaultHostEmail = '',
}: CreateEventModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [hostEmail, setHostEmail] = useState(defaultHostEmail || 'host@eventwishes.com');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState<EventTheme>('gold');
  const [maxDurationSec, setMaxDurationSec] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Event Name is required');
      return;
    }
    if (!date) {
      setError('Event Date is required');
      return;
    }
    if (!hostEmail.trim()) {
      setError('Host Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          date,
          hostEmail: hostEmail.trim(),
          description: description.trim(),
          theme,
          maxDurationSec,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create event');
      }

      const data = await res.json();
      onEventCreated(data.event);
      onClose();
      // Reset form
      setName('');
      setDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Create New Event</h2>
              <p className="text-xs text-zinc-400">Generate guest recording & live wall QR codes instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Event Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Event Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rachel & Ross's Wedding Reception"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-white placeholder-zinc-500 transition-colors"
            />
          </div>

          {/* Date & Host Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Event Date <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-sm text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Host Email <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="host@email.com"
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-sm text-white placeholder-zinc-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Host Message / Welcome Prompt for Guests (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Scan to record a 30-second wish for the bride & groom! We will play it on the big screen tonight."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-sm text-white placeholder-zinc-500 transition-colors resize-none"
            />
          </div>

          {/* Max Video Duration */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Max Guest Video Length
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setMaxDurationSec(sec)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    maxDurationSec === sec
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Theme selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Live Wall & Recording Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEMES.map((th) => (
                <button
                  type="button"
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden bg-gradient-to-br ${
                    th.bgGradient
                  } ${
                    theme === th.id
                      ? `border-2 ${th.borderClass} ring-1 ring-white/20`
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${th.colorClass}`}>{th.name}</span>
                    {theme === th.id && (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${th.colorClass}`} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Creating Event...' : 'Create Event & Generate QRs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
