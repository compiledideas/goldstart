import prisma from '@/lib/prisma';

export async function getVariantsByArticle(articleId: number) {
  return prisma.articleVariant.findMany({
    where: { articleId },
    orderBy: { name: 'asc' },
  });
}

export async function getVariantById(id: number) {
  return prisma.articleVariant.findUnique({
    where: { id },
  });
}

export async function createVariant(data: {
  articleId: number;
  name: string;
  price: number;
  image?: string;
  stock: number;
}) {
  return prisma.articleVariant.create({
    data,
  });
}

export async function updateVariant(id: number, data: {
  name?: string;
  price?: number;
  image?: string;
  stock?: number;
}) {
  return prisma.articleVariant.update({
    where: { id },
    data,
  });
}

export async function deleteVariant(id: number) {
  return prisma.articleVariant.delete({
    where: { id },
  });
}
