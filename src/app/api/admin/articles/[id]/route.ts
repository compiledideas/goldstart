import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getArticleById, updateArticle, deleteArticle, generateSlug } from '@/lib/queries/articles';
import { getVariantsByArticle } from '@/lib/queries/variants';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await getArticleById(parseInt(id));

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Fetch variants for this article
    const variants = await getVariantsByArticle(article.id);

    return NextResponse.json({
      ...article,
      variants,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
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
    const { name, description, categoryId, markId } = body;

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (markId !== undefined) updateData.markId = markId;

    const article = await updateArticle(parseInt(id), updateData);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
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

    await deleteArticle(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
