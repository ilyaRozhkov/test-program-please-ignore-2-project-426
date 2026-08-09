import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateOrderInput {
  userId: number;
  items: { productId: number; quantity: number }[];
  deliveryMethod: 'delivery' | 'pickup';
  recipientName: string;
  phone: string;
  address?: string;
}

export async function createOrder(data: CreateOrderInput) {
  const productIds = data.items.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map(p => [p.id, p]));
  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    if (!product.available) {
      throw new Error(`Product ${item.productId} is not available`);
    }
  }

  const orderItems = data.items.map(item => {
    const product = productMap.get(item.productId)!;
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId: data.userId,
      status: 'paid',
      deliveryMethod: data.deliveryMethod,
      recipientName: data.recipientName,
      phone: data.phone,
      address: data.address,
      total,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  return order;
}

export async function getOrdersByUser(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrderById(id: number, userId: number) {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: { items: true },
  });
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
}