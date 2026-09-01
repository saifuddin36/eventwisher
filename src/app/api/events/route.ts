import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hostEmail = searchParams.get('hostEmail');
    const session = await getServerSession(authOptions);

    const email = hostEmail || session?.user?.email;

    if (!email) {
      // If no host specified, return all events for public/demo overview
      const events = db.getAllEvents();
      return NextResponse.json({ events });
    }

    const events = db.getEventsByHost(email);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to get events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, date, hostEmail, description, theme, maxDurationSec } = body;

    if (!name || !date || !hostEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: name, date, and hostEmail are required.' },
        { status: 400 }
      );
    }

    const newEvent = db.createEvent({
      name,
      date,
      hostEmail,
      description,
      theme,
      maxDurationSec: Number(maxDurationSec) || 45,
    });

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
