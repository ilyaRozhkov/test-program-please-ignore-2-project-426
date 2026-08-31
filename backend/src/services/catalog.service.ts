import { prisma } from '../db/client';

export class CatalogError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    Object.setPrototypeOf(this, CatalogError.prototype);
  }
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function getProducts(params: any) {
  const { category, minPrice, maxPrice, available, search, page = 1, limit = 10 } = params;
  const where: any = {};
  if (category) where.category = { slug: category };
  if (minPrice !== undefined) where.price = { gte: minPrice };
  if (maxPrice !== undefined) where.price = { ...(where.price || {}), lte: maxPrice };
  if (available !== undefined) where.available = available;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: { category: true },
      orderBy: { id: 'asc' },
    }),
    prisma.product.count({ where }),
  ]);
  return {
    items: items.map(p => ({ ...p, price: { amount: p.price } })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) {
    throw new CatalogError('NOT_FOUND', 'Product not found');
  }
  return { ...product, price: { amount: product.price } };
}