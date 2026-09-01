import { Router } from 'express';
import Ajv from 'ajv';
import { schema } from '../validation';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { createOrder, getOrdersByUser, getOrderById, OrderError } from '../services/order.service';
import { errorMessages } from '../utils/errorMessages';

const router = Router();
const ajv = new Ajv({ coerceTypes: true, removeAdditional: false, strict: false, useDefaults: true });

const orderSchema = schema['/api/orders']?.POST?.args;
if (!orderSchema) throw new Error('Order schema not found');
const validateOrder = ajv.compile(orderSchema);

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const valid = validateOrder({ body: req.body });
    if (!valid) {
      console.log('Order validation errors:', JSON.stringify(validateOrder.errors, null, 2));
      const errors = validateOrder.errors?.map(e => e.message).join(', ') || 'Invalid order data';
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: errorMessages.VALIDATION_ERROR || errors }
      });
    }

    const order = await createOrder({
      userId: req.user!.userId,
      items: req.body.items,
      deliveryMethod: req.body.deliveryMethod,
      recipientName: req.body.recipientName,
      phone: req.body.phone,
      address: req.body.address,
    });

    res.status(201).json({ order });
  } catch (err) {
    if (err instanceof OrderError) {
      const status = err.code === 'BAD_REQUEST' ? 400
        : err.code === 'NOT_FOUND' ? 404
        : 400;
      return res.status(status).json({
        error: { code: err.code, message: errorMessages[err.code] || err.message }
      });
    }
    console.error('Order creation error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: errorMessages.INTERNAL_ERROR || 'Failed to create order' }
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
      error: { code: 'INTERNAL_ERROR', message: errorMessages.INTERNAL_ERROR || 'Failed to fetch orders' }
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
        error: { code: 'NOT_FOUND', message: errorMessages.NOT_FOUND || err.message }
      });
    }
    console.error('Fetch order error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: errorMessages.INTERNAL_ERROR || 'Failed to fetch order' }
    });
  }
});

export default router;