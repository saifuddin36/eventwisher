import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { getSupabaseServer, WISHES_STORAGE_BUCKET } from '@/lib/supabase';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
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
    const contentType = file.type || `video/${extension}`;

    // 1. Try Supabase Storage (Production / Cloud persistence)
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const { error: uploadError } = await supabase.storage
          .from(WISHES_STORAGE_BUCKET)
          .upload(filename, buffer, {
            contentType,
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase storage upload failed:', uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from(WISHES_STORAGE_BUCKET)
            .getPublicUrl(filename);

          return NextResponse.json({
            success: true,
            filename,
            videoUrl: publicUrlData.publicUrl,
            fileSize: buffer.length,
            mimeType: contentType,
            storage: 'supabase',
          });
        }
      } catch (err) {
        console.error('Supabase storage error, falling back to local:', err);
      }
    }

    // 2. Fallback to Local Disk (Development)
    if (!fs.existsSync(UPLOADS_DIR)) {
      try {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      } catch {}
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);

    const videoUrl = `/api/videos/${filename}`;

    return NextResponse.json({
      success: true,
      filename,
      videoUrl,
      fileSize: buffer.length,
      mimeType: contentType,
      storage: 'local',
    });
  } catch (error) {
    console.error('Video upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
  }
}
