import prisma from '@/lib/prisma';

export async function getAllArticles() {
  const articles = await prisma.article.findMany({
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      mark: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { order: 'asc' },
  });

  // Transform to match expected format with flat properties
  return articles.map(article => ({
    ...article,
    categoryName: article.category?.name || null,
    categorySlug: article.category?.slug || null,
    markName: article.mark?.name || null,
    markSlug: article.mark?.slug || null,
  }));
}

export async function getArticlesWithVariantsByCategory(categoryId: number) {
  const articles = await prisma.article.findMany({
    where: { categoryId },
    include: {
      mark: {
        select: {
          name: true,
          slug: true,
        },
      },
      variants: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  // Transform to match expected format with flat properties
  return articles.filter(a => a.variants.length > 0).map(article => ({
    ...article,
    markName: article.mark?.name || null,
    markSlug: article.mark?.slug || null,
  }));
}

export async function getArticlesWithVariantsByMark(markId: number) {
  const articles = await prisma.article.findMany({
    where: { markId },
    include: {
      mark: {
        select: {
          name: true,
          slug: true,
        },
      },
      variants: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  // Transform to match expected format with flat properties
  return articles.filter(a => a.variants.length > 0).map(article => ({
    ...article,
    markName: article.mark?.name || null,
    markSlug: article.mark?.slug || null,
  }));
}

export async function getAllArticlesWithVariantsGroupedByMark() {
  const articles = await prisma.article.findMany({
    include: {
      mark: {
        select: {
          name: true,
          slug: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      variants: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  // Group by mark
  const grouped: Record<string, any> = {};

  for (const article of articles) {
    const key = article.mark?.name || 'Sans marque';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    if (article.variants.length > 0) {
      grouped[key].push(article);
    }
  }

  return Object.entries(grouped).map(([markName, articles]) => ({
    markName: markName === 'Sans marque' ? null : markName,
    articles,
  }));
}

export async function getArticlesByCategory(categoryId: number) {
  return prisma.article.findMany({
    where: { categoryId },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      mark: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getArticlesByMark(markId: number) {
  return prisma.article.findMany({
    where: { markId },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      mark: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getArticleById(id: number) {
  return prisma.article.findUnique({
    where: { id },
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
  });
}

export async function getArticleWithVariants(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      variants: {
        orderBy: { name: 'asc' },
      },
    },
  });
}

export async function createArticle(data: {
  name: string;
  slug: string;
  description?: string;
  categoryId: number;
  markId?: number;
}) {
  return prisma.article.create({
    data,
  });
}

export async function updateArticle(id: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: number;
  markId?: number;
}) {
  return prisma.article.update({
    where: { id },
    data,
  });
}

export async function deleteArticle(id: number) {
  return prisma.article.delete({
    where: { id },
  });
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

  const articles = await prisma.article.findMany({
    where: {
      createdAt: {
        gte: fifteenDaysAgo,
      },
    },
    include: {
      mark: {
        select: {
          name: true,
          slug: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      variants: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Transform to match expected format with flat properties
  return articles.filter(a => a.variants.length > 0).map(article => ({
    ...article,
    categoryName: article.category?.name || null,
    categorySlug: article.category?.slug || null,
    markName: article.mark?.name || null,
    markSlug: article.mark?.slug || null,
  }));
}

export async function reorderArticles(articleIds: number[]) {
  return prisma.$transaction(
    articleIds.map((id, index) =>
      prisma.article.update({
        where: { id },
        data: { order: index },
      })
    )
  );
}
