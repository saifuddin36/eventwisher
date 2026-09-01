import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WishStatus } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as WishStatus | null;

    const event = await db.getEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const wishes = await db.getWishesByEvent(event.id, status || undefined);
    return NextResponse.json({ wishes, event });
  } catch (error) {
    console.error('Failed to get wishes:', error);
    return NextResponse.json({ error: 'Failed to fetch wishes' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await db.getEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const body = await req.json();
    const { guestName, message, videoUrl, duration, fileSize, mimeType } = body;

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    const newWish = await db.createWish({
      eventId: event.id,
      guestName: guestName || 'Anonymous Guest',
      message: message || '',
      videoUrl,
      duration: Number(duration) || 15,
      fileSize,
      mimeType,
    });

    return NextResponse.json({ wish: newWish }, { status: 201 });
  } catch (error) {
    console.error('Failed to create wish:', error);
    return NextResponse.json({ error: 'Failed to submit wish' }, { status: 500 });
  }
}
