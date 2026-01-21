import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { getAllMarks, createMark, generateSlug } from '@/lib/queries/marks';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const marks = await getAllMarks();
    return NextResponse.json(marks);
  } catch (_) {
    return NextResponse.json({ error: 'Failed to fetch marks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, image, categoryId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const slug = generateSlug(name);
    const mark = await createMark({
      name,
      slug,
      description: description || null,
      image: image || null,
      categoryId,
    });

    return NextResponse.json(mark, { status: 201 });
  } catch (_) {
    return NextResponse.json({ error: 'Failed to create mark' }, { status: 500 });
  }
}
