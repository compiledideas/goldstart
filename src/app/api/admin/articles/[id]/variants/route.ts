import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { getArticleById } from '@/lib/queries/articles';
import { getVariantsByArticle, createVariant, updateVariant, deleteVariant } from '@/lib/queries/variants';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const article = await getArticleById(parseInt(id));
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const body = await request.json();
    const { variants } = body;

    if (!Array.isArray(variants)) {
      return NextResponse.json({ error: 'Variants must be an array' }, { status: 400 });
    }

    // Get existing variants
    const existingVariants = await getVariantsByArticle(article.id);
    const existingVariantIds = new Set(existingVariants.map(v => v.id));

    // Track which variant IDs were provided in the request
    const providedVariantIds = new Set(variants.filter((v: { id?: number }) => v.id).map((v: { id: number }) => v.id));

    // Delete variants that are not in the new list
    for (const existingVariant of existingVariants) {
      if (!providedVariantIds.has(existingVariant.id)) {
        await deleteVariant(existingVariant.id);
      }
    }

    // Update or create variants
    const updatedVariants = [];
    for (const variant of variants) {
      if (variant.id) {
        // Update existing variant
        const updated = await updateVariant(variant.id, {
          name: variant.name,
          price: variant.price,
          image: variant.image || null,
          stock: variant.stock,
        });
        updatedVariants.push(updated);
      } else {
        // Create new variant
        const created = await createVariant({
          articleId: article.id,
          name: variant.name,
          price: variant.price,
          image: variant.image || null,
          stock: variant.stock,
        });
        updatedVariants.push(created);
      }
    }

    return NextResponse.json(updatedVariants);
  } catch (_) {
    return NextResponse.json({ error: 'Failed to update variants' }, { status: 500 });
  }
}
