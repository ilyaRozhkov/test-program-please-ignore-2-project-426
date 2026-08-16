import { Router } from 'express';
import { prisma } from '../db/client';
import { getCategories, getProducts, getProductBySlug } from '../services/catalog.service';

const router = Router();

router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories' } });
  }
});

router.get('/products', async (req, res) => {
  try {
    const params = {
      category: req.query.category as string,
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string, 10) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : undefined,
      available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };
    const result = await getProducts(params);
    res.json(result);
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch products' } });
  }
});

router.get('/products/:slug', async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    res.json(product);
  } catch (err: any) {
    if (err.message === 'Product not found') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: err.message } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch product' } });
    }
  }
});

router.post('/products/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'ids array required' } });
    }
    const numericIds = ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
    const products = await prisma.product.findMany({
      where: { id: { in: numericIds } },
      include: { category: true },
    });
    res.json(products.map(p => ({ ...p, price: { amount: p.price } })));
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch products' } });
  }
});

export default router;