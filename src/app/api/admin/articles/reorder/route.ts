import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { reorderArticles } from '@/lib/queries/articles';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleIds } = body;

    if (!Array.isArray(articleIds)) {
      return NextResponse.json({ error: 'articleIds must be an array' }, { status: 400 });
    }

    await reorderArticles(articleIds);

    return NextResponse.json({ success: true });
  } catch (_) {
    return NextResponse.json({ error: 'Failed to reorder articles' }, { status: 500 });
  }
}
