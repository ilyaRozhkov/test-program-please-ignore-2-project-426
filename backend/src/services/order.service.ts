import { prisma } from '../db/client';

export interface CreateOrderInput {
  userId: number;
  items: { productId: number; quantity: number }[];
  deliveryMethod: 'delivery' | 'pickup';
  recipientName: string;
  phone: string;
  address?: string;
}

export async function createOrder(data: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    const productIds = data.items.map(i => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    const errors: string[] = [];
    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        errors.push(`Product ${item.productId} not found`);
      } else if (!product.available) {
        errors.push(`Product ${product.name} (ID: ${product.id}) is not available`);
      } else if (item.quantity < 1) {
        errors.push(`Invalid quantity ${item.quantity} for product ${product.name}`);
      }
    }
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
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

    const order = await tx.order.create({
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

    return {
      ...order,
      items: order.items.map(item => ({
        ...item,
        price: { amount: item.price },
      })),
      total: order.total, 
    };
  });
}

export async function getOrdersByUser(userId: number) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(order => ({
    ...order,
    items: order.items.map(item => ({
      ...item,
      price: { amount: item.price },
    })),
    total: order.total,
  }));
}

export async function getOrderById(id: number, userId: number) {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: { items: true },
  });
  if (!order) throw new Error('Order not found');
  return {
    ...order,
    items: order.items.map(item => ({
      ...item,
      price: { amount: item.price },
    })),
    total: order.total,
  };
}
