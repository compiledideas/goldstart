import { NextRequest, NextResponse } from 'next/server';
import { getFileFromMinio } from '@/lib/minio';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const { filename } = await params;
    const filenameStr = Array.isArray(filename) ? filename.join('/') : filename;

    // Get file from MinIO
    const { buffer, contentType } = await getFileFromMinio(filenameStr);

    // Return file with appropriate headers
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Image serve error:', error);
    if (error.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
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
