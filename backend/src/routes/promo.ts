import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const promos = await prisma.promoBlock.findMany({
      include: { product: true },
    });
    res.json(promos.map(p => ({
      ...p,
      product: {
        ...p.product,
        price: { amount: p.product.price },
      },
    })));
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch promo' } });
  }
});

export default router;