import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'EventWishes - Interactive Video Guestbook & Venue Live Wall',
  description:
    'Collect heartfelt video wishes from event guests via instant QR codes and showcase them live on venue screens in real-time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="bg-[#090a0f] text-[#f3f4f6] min-h-screen antialiased selection:bg-amber-500 selection:text-zinc-950"
        style={{ backgroundColor: "#090a0f", color: "#f3f4f6" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
