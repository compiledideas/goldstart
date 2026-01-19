import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMarkById, updateMark, deleteMark, generateSlug } from '@/lib/queries/marks';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mark = await getMarkById(parseInt(id));

    if (!mark) {
      return NextResponse.json({ error: 'Mark not found' }, { status: 404 });
    }

    return NextResponse.json(mark);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mark' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, image, categoryId } = body;

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const mark = await updateMark(parseInt(id), updateData);

    if (!mark) {
      return NextResponse.json({ error: 'Mark not found' }, { status: 404 });
    }

    return NextResponse.json(mark);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update mark' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteMark(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete mark' }, { status: 500 });
  }
}
