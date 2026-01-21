import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const { filename } = await params;
    const filenameStr = Array.isArray(filename) ? filename.join('/') : filename;

    // Get upload directory from environment or fallback to local uploads folder
    const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    const filepath = join(uploadDir, filenameStr);

    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read file and determine content type
    const file = await readFile(filepath);
    const ext = filenameStr.split('.').pop()?.toLowerCase();
    const contentType = getContentType(ext || '');

    // Return file with appropriate headers
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (_) {
    console.error('Image serve error');
    return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 });
  }
}

function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
  };
  return contentTypes[ext] || 'application/octet-stream';
}
