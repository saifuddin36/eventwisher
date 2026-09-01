'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Sparkles, Video, LayoutDashboard, LogOut, LogIn, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenCreate?: () => void;
}

export function Navbar({ onOpenCreate }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // If in venue fullscreen wall or mobile record mode, minimal navbar or hidden
  const isWall = pathname.includes('/wall');
  const isRecord = pathname.includes('/record');

  if (isWall) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#0d0e15] rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Event<span className="text-amber-400">Wishes</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">
              Interactive Video Guestbook
            </span>
          </div>
        </Link>

        {/* Center / Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">My Events</span>
              </Link>

              {onOpenCreate && (
                <button
                  onClick={onOpenCreate}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Event</span>
                </button>
              )}

              {/* Host Profile info */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'Host'}
                    className="w-8 h-8 rounded-full border border-amber-500/40 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                    {session.user?.name?.charAt(0) || 'H'}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {session.user?.name || 'Host'}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                    {session.user?.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Host Sign In</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
