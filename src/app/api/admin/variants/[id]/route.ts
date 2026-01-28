import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { updateVariant, deleteVariant } from '@/lib/queries/variants';

export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, price, image, stock } = body;

    const variant = await updateVariant(parseInt(id), {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price }),
      ...(image !== undefined && { image }),
      ...(stock !== undefined && { stock }),
    });

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    return NextResponse.json(variant);
  } catch (_) {
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteVariant(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (_) {
    return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 });
  }
}
