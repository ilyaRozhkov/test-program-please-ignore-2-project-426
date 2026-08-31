import { Router } from 'express';
import Ajv from 'ajv';
// Импортируем схему из сгенерированного validation.ts
// Убедитесь, что путь правильный: ../validation или ../validation/validation
import { schema } from '../validation';

import { prisma } from '../db/client';
import { getCategories, getProducts, getProductBySlug, CatalogError } from '../services/catalog.service';

const router = Router();

// Настройка Ajv с отключённым строгим режимом
const ajv = new Ajv({
  coerceTypes: true,          // преобразует строки в числа/булевы
  removeAdditional: true,     // удаляет лишние поля
  strict: false,              // отключаем строгий режим → игнорирует неизвестные форматы
});

const productsArgsSchema = schema['/api/catalog/products']?.GET?.args;
if (!productsArgsSchema) {
  throw new Error('Products schema not found in validation');
}
const validateProductsQuery = ajv.compile(productsArgsSchema);

// GET /categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories' } });
  }
});

// GET /products – с валидацией
router.get('/products', async (req, res) => {
  try {
    // 1. Валидируем query-параметры (передаём объект с полем query)
    const valid = validateProductsQuery({ query: { params: req.query } });
    if (!valid) {
      const errors = validateProductsQuery.errors?.map(e => e.message).join(', ') || 'Invalid query parameters';
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: errors }
      });
    }

    // 2. Извлекаем параметры
    const q = req.query;
    const params = {
      category: q.category as string,
      minPrice: q.minPrice ? Number(q.minPrice) : undefined,
      maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
      available: q.available === 'true' ? true : q.available === 'false' ? false : undefined,
      search: q.search as string,
      page: Number(q.page) || 1,
      limit: Math.min(Number(q.limit) || 10, 100),
    };

    const result = await getProducts(params);
    res.json(result);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// GET /products/:slug
router.get('/products/:slug', async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    res.json(product);
  } catch (err) {
    if (err instanceof CatalogError && err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: err.message } });
    }
    console.error('Error fetching product:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// POST /products/batch
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