'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, Download, Printer, Smartphone, Tv, Sparkles } from 'lucide-react';
import { EventItem } from '@/types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  onOpenPrintFlyer?: (event: EventItem) => void;
}

export function QRCodeModal({ isOpen, onClose, event, onOpenPrintFlyer }: QRCodeModalProps) {
  const [copiedType, setCopiedType] = useState<'record' | 'wall' | null>(null);
  const [activeTab, setActiveTab] = useState<'guest' | 'wall'>('guest');

  const guestQrRef = useRef<HTMLDivElement>(null);
  const wallQrRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !event) return null;

  // Use window.location.origin in client
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const guestRecordUrl = `${baseUrl}/e/${event.id}/record`;
  const publicWallUrl = `${baseUrl}/e/${event.id}/wall`;

  const copyToClipboard = (text: string, type: 'record' | 'wall') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadQrCode = (elementId: string, filename: string) => {
    const svgElement = document.querySelector(`#${elementId} svg`) as SVGGraphicsElement | null;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${filename}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f111a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold truncate max-w-md">{event.name}</h2>
              <p className="text-xs text-zinc-400">QR Codes for Guests & Venue Display</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 p-2 mx-6 mt-4 bg-black/40 rounded-2xl border border-white/5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'guest'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Guest Recording QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wall')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'wall'
                ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>2. Public Live Wall QR</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'guest' ? (
            /* Guest Recording QR */
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" /> For Guests & Tables (Video Recording)
              </div>

              {/* QR Container */}
              <div
                id="guest-qr-container"
                ref={guestQrRef}
                className="p-5 bg-white rounded-3xl shadow-xl border-4 border-amber-500/20 transition-transform duration-300 hover:scale-105"
              >
                <QRCodeSVG
                  value={guestRecordUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: 'https://cdn-icons-png.flaticon.com/512/3233/3233515.png',
                    x: undefined,
                    y: undefined,
                    height: 38,
                    width: 38,
                    excavate: true,
                  }}
                />
              </div>

              <p className="text-xs text-zinc-400 max-w-sm">
                Print or share this QR code on guest tables, invitations, or cocktail signs. Guests scan with their phone camera to record a video wish!
              </p>

              {/* URL bar with copy */}
              <div className="w-full flex items-center gap-2 p-2 bg-black/40 border border-white/10 rounded-2xl">
                <input
                  type="text"
                  readOnly
                  value={guestRecordUrl}
                  className="flex-1 bg-transparent px-3 text-xs text-zinc-300 outline-none truncate font-mono"
                />
                <button
                  onClick={() => copyToClipboard(guestRecordUrl, 'record')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                >
                  {copiedType === 'record' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={guestRecordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  title="Open recording page in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
                <button
                  onClick={() => downloadQrCode('guest-qr-container', `${event.slug}-guest-record-qr`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download QR (PNG)
                </button>
                {onOpenPrintFlyer && (
                  <button
                    onClick={() => onOpenPrintFlyer(event)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Printable Table Stand Flyer
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Public Live Wall QR */
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Tv className="w-3.5 h-3.5" /> For Venue Projector / Screen (Live Wall)
              </div>

              {/* QR Container */}
              <div
                id="wall-qr-container"
                ref={wallQrRef}
                className="p-5 bg-white rounded-3xl shadow-xl border-4 border-cyan-500/20 transition-transform duration-300 hover:scale-105"
              >
                <QRCodeSVG
                  value={publicWallUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: 'https://cdn-icons-png.flaticon.com/512/2859/2859706.png',
                    x: undefined,
                    y: undefined,
                    height: 38,
                    width: 38,
                    excavate: true,
                  }}
                />
              </div>

              <p className="text-xs text-zinc-400 max-w-sm">
                Open this URL on the venue big screen, projector, or TV. It auto-refreshes and projects only approved video wishes with animations and sound!
              </p>

              {/* URL bar with copy */}
              <div className="w-full flex items-center gap-2 p-2 bg-black/40 border border-white/10 rounded-2xl">
                <input
                  type="text"
                  readOnly
                  value={publicWallUrl}
                  className="flex-1 bg-transparent px-3 text-xs text-zinc-300 outline-none truncate font-mono"
                />
                <button
                  onClick={() => copyToClipboard(publicWallUrl, 'wall')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                >
                  {copiedType === 'wall' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={publicWallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  title="Open live wall in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
                <button
                  onClick={() => downloadQrCode('wall-qr-container', `${event.slug}-live-wall-qr`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download QR (PNG)
                </button>
                <a
                  href={publicWallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
                >
                  <Tv className="w-3.5 h-3.5" /> Launch Fullscreen Wall
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
