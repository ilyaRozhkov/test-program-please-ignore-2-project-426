import { prisma } from '../db/client';

export class OrderError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    Object.setPrototypeOf(this, OrderError.prototype);
  }
}

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
    // 1. Проверяем, что корзина не пуста
    if (!data.items || data.items.length === 0) {
      throw new OrderError('VALIDATION_ERROR', 'Cart is empty');
    }

    // 2. Валидация каждого элемента корзины
    const errors: string[] = [];

    for (const item of data.items) {
      // Проверка productId – должно быть целым положительным числом
      if (!Number.isInteger(item.productId) || item.productId < 1) {
        errors.push(`Invalid productId: ${item.productId} (must be a positive integer)`);
      }
      // Проверка quantity – целое положительное, не больше 999
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) {
        errors.push(`Invalid quantity ${item.quantity} for product ${item.productId}`);
      }
    }

    if (errors.length > 0) {
      throw new OrderError('BAD_REQUEST', errors.join('; '));
    }

    // 3. Получаем товары из базы
    const productIds = data.items.map(i => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    // 4. Проверяем доступность и наличие
    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        errors.push(`Product with id ${item.productId} not found`);
      } else if (!product.available) {
        errors.push(`Product "${product.name}" (id: ${product.id}) is not available`);
      }
    }

    if (errors.length > 0) {
      throw new OrderError('BAD_REQUEST', errors.join('; '));
    }

    // 5. Формируем позиции заказа
    const orderItems = data.items.map(item => {
      const product = productMap.get(item.productId)!;
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    // 6. Считаем итог
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 7. Создаём заказ
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
  if (!order) {
    throw new OrderError('NOT_FOUND', 'Order not found');
  }
  return {
    ...order,
    items: order.items.map(item => ({
      ...item,
      price: { amount: item.price },
    })),
    total: order.total,
  };
}