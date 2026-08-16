import { Router } from 'express';
import { prisma } from '../db/client';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const promos = await prisma.promoBlock.findMany({
      where: { product: { available: true } },
      include: { product: true },
    });
    res.json(promos.map(p => ({
      ...p,
      product: { ...p.product, price: { amount: p.product.price } },
    })));
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch promo' } });
  }
});

export default router;