import prisma from '@/lib/prisma';

export type CategoryWithIncludes = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
};

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCategoryById(id: number) {
  return prisma.category.findUnique({
    where: { id },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}) {
  return prisma.category.create({
    data,
  });
}

export async function updateCategory(id: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
}) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: number) {
  return prisma.category.delete({
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
