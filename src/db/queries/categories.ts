import db from '@/db';
import { categories } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getAllCategories() {
  return db.select().from(categories).orderBy(desc(categories.createdAt));
}

export async function getCategoryById(id: number) {
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0];
}

export async function getCategoryBySlug(slug: string) {
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}) {
  const result = await db.insert(categories).values(data).returning();
  return result[0];
}

export async function updateCategory(id: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
}) {
  const result = await db.update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();
  return result[0];
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
