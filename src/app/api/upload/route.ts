import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const formData = await req.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine extension
    let extension = 'webm';
    if (file.type.includes('mp4')) extension = 'mp4';
    else if (file.type.includes('mov') || file.type.includes('quicktime')) extension = 'mov';
    else if (file.type.includes('webm')) extension = 'webm';

    const filename = `wish-${Date.now()}-${nanoid(6)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    const videoUrl = `/api/videos/${filename}`;

    return NextResponse.json({
      success: true,
      filename,
      videoUrl,
      fileSize: buffer.length,
      mimeType: file.type || `video/${extension}`,
    });
  } catch (error) {
    console.error('Video upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
  }
}
