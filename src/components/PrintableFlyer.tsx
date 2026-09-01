'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Sparkles, Video, Heart } from 'lucide-react';
import { EventItem } from '@/types';

interface PrintableFlyerProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

export function PrintableFlyer({ isOpen, onClose, event }: PrintableFlyerProps) {
  if (!isOpen || !event) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const guestRecordUrl = `${baseUrl}/e/${event.id}/record`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-lg bg-white text-zinc-900 rounded-3xl shadow-2xl p-8 my-8 print:m-0 print:p-8 print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Controls - Hidden in print */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4" /> Print Flyer
          </button>
        </div>

        {/* Printable Card Design */}
        <div className="border-4 border-amber-400/80 rounded-2xl p-6 text-center bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 flex flex-col items-center">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Event Video Guestbook
          </div>

          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight mb-2">
            {event.name}
          </h1>

          <p className="text-sm text-zinc-600 mb-6 max-w-xs">
            {event.description || 'Scan the QR code below with your phone camera to record a short video message for our live wall!'}
          </p>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-amber-300 mb-6">
            <QRCodeSVG
              value={guestRecordUrl}
              size={210}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Simple 3-Step Instructions */}
          <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-amber-200/80 text-center">
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mb-1">
                1
              </span>
              <span className="text-[11px] font-bold text-zinc-800">Scan QR</span>
              <span className="text-[9px] text-zinc-500">Open with camera</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mb-1">
                2
              </span>
              <span className="text-[11px] font-bold text-zinc-800">Record Wish</span>
              <span className="text-[9px] text-zinc-500">Short video greeting</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mb-1">
                3
              </span>
              <span className="text-[11px] font-bold text-zinc-800">See on Screen</span>
              <span className="text-[9px] text-zinc-500">Plays on Live Wall</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-amber-800 font-semibold">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Thank you for making our day unforgettable!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
