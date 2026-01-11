import db from '@/db';
import { articles, marks, categories, articleVariants } from '@/db/schema';
import { eq, desc, asc, gte, sql } from 'drizzle-orm';

export async function getAllArticles() {
  return db.select({
    id: articles.id,
    name: articles.name,
    slug: articles.slug,
    description: articles.description,
    categoryId: articles.categoryId,
    markId: articles.markId,
    createdAt: articles.createdAt,
    categoryName: categories.name,
    categorySlug: categories.slug,
    markName: marks.name,
    markSlug: marks.slug,
  }).from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(marks, eq(articles.markId, marks.id))
    .orderBy(desc(articles.createdAt));
}

export async function getArticlesWithVariantsByCategory(categoryId: number) {
  const articlesResult = await db.select({
    id: articles.id,
    name: articles.name,
    slug: articles.slug,
    description: articles.description,
    categoryId: articles.categoryId,
    markId: articles.markId,
    markName: marks.name,
    markSlug: marks.slug,
  }).from(articles)
    .leftJoin(marks, eq(articles.markId, marks.id))
    .where(eq(articles.categoryId, categoryId))
    .orderBy(asc(marks.name), asc(articles.name));

  // Fetch variants for each article
  const articlesWithVariants = await Promise.all(
    articlesResult.map(async (article) => {
      const variants = await db.select()
        .from(articleVariants)
        .where(eq(articleVariants.articleId, article.id))
        .orderBy(asc(articleVariants.name));
      return {
        ...article,
        variants,
      };
    })
  );

  return articlesWithVariants;
}

export async function getArticlesWithVariantsByMark(markId: number) {
  const articlesResult = await db.select({
    id: articles.id,
    name: articles.name,
    slug: articles.slug,
    description: articles.description,
    categoryId: articles.categoryId,
    markId: articles.markId,
    markName: marks.name,
    markSlug: marks.slug,
  }).from(articles)
    .leftJoin(marks, eq(articles.markId, marks.id))
    .where(eq(articles.markId, markId))
    .orderBy(asc(articles.name));

  // Fetch variants for each article
  const articlesWithVariants = await Promise.all(
    articlesResult.map(async (article) => {
      const variants = await db.select()
        .from(articleVariants)
        .where(eq(articleVariants.articleId, article.id))
        .orderBy(asc(articleVariants.name));
      return {
        ...article,
        variants,
      };
    })
  );

  return articlesWithVariants;
}

export async function getAllArticlesWithVariantsGroupedByMark() {
  const articlesResult = await db.select({
    id: articles.id,
    name: articles.name,
    slug: articles.slug,
    description: articles.description,
    categoryId: articles.categoryId,
    markId: articles.markId,
    markName: marks.name,
    markSlug: marks.slug,
    categoryName: categories.name,
  }).from(articles)
    .leftJoin(marks, eq(articles.markId, marks.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .orderBy(asc(marks.name), asc(articles.name));

  // Group by mark
  const grouped = new Map<string | null, typeof articlesResult & { variants: any[] }>();

  for (const article of articlesResult) {
    const key = article.markName || 'Sans marque';
    if (!grouped.has(key)) {
      grouped.set(key, { ...article, variants: [] });
    }
    const variants = await db.select()
      .from(articleVariants)
      .where(eq(articleVariants.articleId, article.id))
      .orderBy(asc(articleVariants.price));

    grouped.get(key)!.variants.push({
      ...article,
      variants,
    });
  }

  // Convert to array and fetch variants for each article
  const result = [];
  for (const [markName, data] of grouped) {
    const articlesWithVariants = await Promise.all(
      data.variants.map(async (article: any) => {
        const variants = await db.select()
          .from(articleVariants)
          .where(eq(articleVariants.articleId, article.id))
          .orderBy(asc(articleVariants.name));
        return {
          ...article,
          variants,
        };
      })
    );
    result.push({
      markName: markName === 'Sans marque' ? null : data.markName,
      markSlug: data.markSlug,
      articles: articlesWithVariants.filter(a => a.variants.length > 0),
    });
  }

  return result;
}

export async function getArticlesByCategory(categoryId: number) {
  return db.select({
    id: articles.id,
    name: articles.name,
    slug: articles.slug,
    description: articles.description,
    categoryId: articles.categoryId,
    markId: articles.markId,
    createdAt: articles.createdAt,
    categoryName: categories.name,
    categorySlug: categories.slug,
    markName: marks.name,
    markSlug: marks.slug,
  }).from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(marks, eq(articles.markId, marks.id))
    .where(eq(articles.categoryId, categoryId))
    .orderBy(asc(articles.name));
}

export async function getArticlesByMark(markId: number) {
  return db.select({
    id: articles.id,
    name: articles.name,
    slug: articles.slug,
    description: articles.description,
    categoryId: articles.categoryId,
    markId: articles.markId,
    createdAt: articles.createdAt,
    categoryName: categories.name,
    categorySlug: categories.slug,
    markName: marks.name,
    markSlug: marks.slug,
  }).from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(marks, eq(articles.markId, marks.id))
    .where(eq(articles.markId, markId))
    .orderBy(asc(articles.name));
}

export async function getArticleById(id: number) {
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result[0];
}

export async function getArticleBySlug(slug: string) {
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result[0];
}

export async function getArticleWithVariants(slug: string) {
  const articleResult = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  if (!articleResult[0]) return null;

  const variantsResult = await db.select()
    .from(articleVariants)
    .where(eq(articleVariants.articleId, articleResult[0].id))
    .orderBy(asc(articleVariants.name));

  return {
    ...articleResult[0],
    variants: variantsResult,
  };
}

export async function createArticle(data: {
  name: string;
  slug: string;
  description?: string;
  categoryId: number;
  markId?: number;
}) {
  const result = await db.insert(articles).values(data).returning();
  return result[0];
}

export async function updateArticle(id: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: number;
  markId?: number;
}) {
  const result = await db.update(articles)
    .set(data)
    .where(eq(articles.id, id))
    .returning();
  return result[0];
}

export async function deleteArticle(id: number) {
  await db.delete(articles).where(eq(articles.id, id));
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

export async function getRecentArticlesWithVariants(days: number = 15) {
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - days);

  const articlesResult = await db.select({
    id: articles.id,
    name: articles.name,
    slug: articles.slug,
    description: articles.description,
    categoryId: articles.categoryId,
    markId: articles.markId,
    markName: marks.name,
    markSlug: marks.slug,
    categoryName: categories.name,
    categorySlug: categories.slug,
    createdAt: articles.createdAt,
  }).from(articles)
    .leftJoin(marks, eq(articles.markId, marks.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(gte(articles.createdAt, fifteenDaysAgo))
    .orderBy(desc(articles.createdAt));

  // Fetch variants for each article
  const articlesWithVariants = await Promise.all(
    articlesResult.map(async (article) => {
      const variants = await db.select()
        .from(articleVariants)
        .where(eq(articleVariants.articleId, article.id))
        .orderBy(asc(articleVariants.name));
      return {
        ...article,
        variants,
      };
    })
  );

  return articlesWithVariants.filter(a => a.variants.length > 0);
}
