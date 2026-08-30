import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { createOrder, getOrdersByUser, getOrderById, OrderError } from '../services/order.service';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { items, deliveryMethod, recipientName, phone, address } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Items array is required and must not be empty' }
      });
    }
    if (!deliveryMethod || !recipientName || !phone) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: deliveryMethod, recipientName, phone' }
      });
    }
    if (deliveryMethod === 'delivery' && !address) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Address is required for delivery' }
      });
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
  } catch (err) {
    if (err instanceof OrderError) {
      const status = err.code === 'BAD_REQUEST' ? 400
        : err.code === 'NOT_FOUND' ? 404
        : 400; // по умолчанию
      return res.status(status).json({
        error: { code: err.code, message: err.message }
      });
    }
    console.error('Order creation error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create order' }
    });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await getOrdersByUser(req.user!.userId);
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch orders' }
    });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await getOrderById(Number(req.params.id), req.user!.userId);
    res.json(order);
  } catch (err) {
    if (err instanceof OrderError && err.code === 'NOT_FOUND') {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: err.message }
      });
    }
    console.error('Fetch order error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch order' }
    });
  }
});

export default router;