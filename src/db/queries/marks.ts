import db from '@/db';
import { marks, categories } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

export async function getAllMarks() {
  return db.select({
    id: marks.id,
    name: marks.name,
    slug: marks.slug,
    description: marks.description,
    image: marks.image,
    categoryId: marks.categoryId,
    createdAt: marks.createdAt,
    categoryName: categories.name,
  }).from(marks).leftJoin(categories, eq(marks.categoryId, categories.id)).orderBy(desc(marks.createdAt));
}

export async function getMarksByCategory(categoryId: number) {
  return db.select().from(marks).where(eq(marks.categoryId, categoryId)).orderBy(asc(marks.name));
}

export async function getMarkById(id: number) {
  const result = await db.select().from(marks).where(eq(marks.id, id)).limit(1);
  return result[0];
}

export async function getMarkBySlug(slug: string) {
  const result = await db.select().from(marks).where(eq(marks.slug, slug)).limit(1);
  return result[0];
}

export async function createMark(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  categoryId: number;
}) {
  const result = await db.insert(marks).values(data).returning();
  return result[0];
}

export async function updateMark(id: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  categoryId?: number;
}) {
  const result = await db.update(marks)
    .set(data)
    .where(eq(marks.id, id))
    .returning();
  return result[0];
}

export async function deleteMark(id: number) {
  await db.delete(marks).where(eq(marks.id, id));
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
