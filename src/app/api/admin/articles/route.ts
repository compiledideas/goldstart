import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { getAllArticles, createArticle, generateSlug } from '@/lib/queries/articles';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const articles = await getAllArticles();
    return NextResponse.json(articles);
  } catch (_) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, categoryId, markId, variants } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const slug = generateSlug(name);
    const article = await createArticle({
      name,
      slug,
      description: description || null,
      categoryId,
      markId: markId || null,
    });

    // If variants are provided, create them
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const { createVariant } = await import('@/lib/queries/variants');
      for (const variant of variants) {
        await createVariant({
          articleId: article.id,
          name: variant.name,
          price: variant.price,
          image: variant.image || null,
          stock: variant.stock || 0,
        });
      }
    }

    return NextResponse.json(article, { status: 201 });
  } catch (_) {
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
