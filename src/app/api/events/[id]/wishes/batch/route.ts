import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WishStatus } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { wishIds, status } = body as { wishIds: string[]; status: WishStatus };

    if (!Array.isArray(wishIds) || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid wishIds array or status' }, { status: 400 });
    }

    const count = await db.bulkUpdateWishStatus(wishIds, status);
    const updatedWishes = await db.getWishesByEvent(id);

    return NextResponse.json({ updatedCount: count, wishes: updatedWishes });
  } catch (error) {
    console.error('Failed to batch update wishes:', error);
    return NextResponse.json({ error: 'Failed to batch update wishes' }, { status: 500 });
  }
}
