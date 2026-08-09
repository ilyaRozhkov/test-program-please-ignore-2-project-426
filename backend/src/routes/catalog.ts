import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { getCategories, getProducts, getProductBySlug } from '../services/catalog.service';

const router = Router();
const prisma = new PrismaClient();

// GET /categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories' } });
  }
});

// GET /products
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
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch products' } });
  }
});

// GET /products/:slug
router.get('/products/:slug', async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    res.json(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    if (error.message === 'Product not found') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: error.message } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch product' } });
    }
  }
});

// POST /products/batch – новый эндпоинт для корзины
router.post('/products/batch', async (req, res) => {
  console.log('[batch] Received request with body:', req.body);
  try {
    const { ids } = req.body;

    // Валидация
    if (!ids) {
      console.error('[batch] ids is missing');
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'ids is required' } });
    }
    if (!Array.isArray(ids)) {
      console.error('[batch] ids is not an array');
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'ids must be an array' } });
    }
    if (ids.length === 0) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'ids array cannot be empty' } });
    }

    // Преобразуем в числа
    const numericIds = ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
    if (numericIds.length === 0) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'No valid product ids provided' } });
    }

    console.log('[batch] Fetching products with ids:', numericIds);

    // Запрос к БД
    const products = await prisma.product.findMany({
      where: { id: { in: numericIds } },
      include: { category: true },
    });

    console.log('[batch] Found products:', products.length);

    // Форматируем ответ
    const result = products.map(p => ({
      ...p,
      price: { amount: p.price },
    }));

    res.json(result);
  } catch (error) {
    console.error('[batch] Error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch products',
      },
    });
  }
});

export default router;