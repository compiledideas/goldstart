import db from '@/db';
import { articleVariants } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function getVariantsByArticle(articleId: number) {
  return db.select().from(articleVariants).where(eq(articleVariants.articleId, articleId)).orderBy(asc(articleVariants.name));
}

export async function getVariantById(id: number) {
  const result = await db.select().from(articleVariants).where(eq(articleVariants.id, id)).limit(1);
  return result[0];
}

export async function createVariant(data: {
  articleId: number;
  name: string;
  price: number;
  image?: string;
  stock: number;
}) {
  const result = await db.insert(articleVariants).values(data).returning();
  return result[0];
}

export async function updateVariant(id: number, data: {
  name?: string;
  price?: number;
  image?: string;
  stock?: number;
}) {
  const result = await db.update(articleVariants)
    .set(data)
    .where(eq(articleVariants.id, id))
    .returning();
  return result[0];
}

export async function deleteVariant(id: number) {
  await db.delete(articleVariants).where(eq(articleVariants.id, id));
}
