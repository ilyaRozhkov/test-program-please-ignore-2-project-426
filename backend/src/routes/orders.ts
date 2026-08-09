import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { createOrder, getOrdersByUser, getOrderById } from '../services/order.service';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { items, deliveryMethod, recipientName, phone, address } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Items are required' } });
    }
    if (!deliveryMethod || !recipientName || !phone) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } });
    }
    if (deliveryMethod === 'delivery' && !address) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Address is required for delivery' } });
    }

    const order = await createOrder({
      userId: req.user!.userId,
      items,
      deliveryMethod,
      recipientName,
      phone,
      address,
    });

    res.status(201).json({ order });
  } catch (err: any) {
    if (err.message.startsWith('Product')) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: err.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create order' } });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await getOrdersByUser(req.user!.userId);
    res.json(orders);
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch orders' } });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await getOrderById(Number(req.params.id), req.user!.userId);
    res.json(order);
  } catch (err: any) {
    if (err.message === 'Order not found') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: err.message } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch order' } });
    }
  }
});

export default router;