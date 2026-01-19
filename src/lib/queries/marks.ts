import prisma from '@/lib/prisma';

export async function getAllMarks() {
  return prisma.mark.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMarksByCategory(categoryId: number) {
  return prisma.mark.findMany({
    where: { categoryId },
    orderBy: { name: 'asc' },
  });
}

export async function getMarkById(id: number) {
  return prisma.mark.findUnique({
    where: { id },
  });
}

export async function getMarkBySlug(slug: string) {
  return prisma.mark.findUnique({
    where: { slug },
  });
}

export async function createMark(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  categoryId: number;
}) {
  return prisma.mark.create({
    data,
  });
}

export async function updateMark(id: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  categoryId?: number;
}) {
  return prisma.mark.update({
    where: { id },
    data,
  });
}

export async function deleteMark(id: number) {
  return prisma.mark.delete({
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
