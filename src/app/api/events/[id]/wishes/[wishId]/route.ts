import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WishStatus } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; wishId: string }> }
) {
  try {
    const { wishId } = await params;
    const body = await req.json();
    const { status } = body as { status: WishStatus };

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Valid status (pending, approved, rejected) is required' }, { status: 400 });
    }

    const updatedWish = await db.updateWishStatus(wishId, status);
    if (!updatedWish) {
      return NextResponse.json({ error: 'Wish not found' }, { status: 404 });
    }

    return NextResponse.json({ wish: updatedWish });
  } catch (error) {
    console.error('Failed to update wish:', error);
    return NextResponse.json({ error: 'Failed to update wish status' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; wishId: string }> }
) {
  try {
    const { wishId } = await params;
    const deleted = await db.deleteWish(wishId);

    if (!deleted) {
      return NextResponse.json({ error: 'Wish not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Wish deleted successfully' });
  } catch (error) {
    console.error('Failed to delete wish:', error);
    return NextResponse.json({ error: 'Failed to delete wish' }, { status: 500 });
  }
}
