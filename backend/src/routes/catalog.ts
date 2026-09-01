import { Router } from 'express';
import Ajv from 'ajv';
import { schema } from '../validation';
import { getCategories, getProducts, getProductBySlug, CatalogError } from '../services/catalog.service';
import { prisma } from '../db/client';
import { errorMessages } from '../utils/errorMessages';

const router = Router();

// Ajv с поддержкой дефолтов
const ajv = new Ajv({
  coerceTypes: true,
  removeAdditional: false, // не удаляем лишние поля
  strict: false,
  useDefaults: true,
});

const productsSchema = schema['/api/catalog/products']?.GET?.args;
if (!productsSchema) throw new Error('Products schema not found');
const validateProducts = ajv.compile(productsSchema);

router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: errorMessages.INTERNAL_ERROR || 'Failed to fetch categories' }
    });
  }
});

router.get('/products', async (req, res) => {
  try {
    // Валидация плоских параметров
    const valid = validateProducts({ query: req.query });
    if (!valid) {
      console.log('Validation errors:', JSON.stringify(validateProducts.errors, null, 2));
      const errors = validateProducts.errors?.map(e => e.message).join(', ') || 'Invalid parameters';
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: errorMessages.VALIDATION_ERROR || errors }
      });
    }

    // После валидации параметры уже приведены к типам, дефолты применены.
    const q = req.query as any;
    const result = await getProducts({
      category: q.category,
      minPrice: q.minPrice,
      maxPrice: q.maxPrice,
      available: q.available,
      search: q.search,
      page: q.page,
      limit: q.limit,
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: errorMessages.INTERNAL_ERROR || 'Internal server error' }
    });
  }
});

router.get('/products/:slug', async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    res.json(product);
  } catch (err) {
    if (err instanceof CatalogError) {
      return res.status(err.code === 'NOT_FOUND' ? 404 : 400).json({
        error: { code: err.code, message: errorMessages[err.code] || err.message }
      });
    }
    console.error('Error fetching product:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: errorMessages.INTERNAL_ERROR || 'Internal server error' }
    });
  }
});

router.post('/products/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: errorMessages.VALIDATION_ERROR || 'ids array required' }
      });
    }
    const numericIds = ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
    const products = await prisma.product.findMany({
      where: { id: { in: numericIds } },
      include: { category: true },
    });
    res.json(products.map(p => ({ ...p, price: { amount: p.price } })));
  } catch (err) {
    console.error('Error in batch:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: errorMessages.INTERNAL_ERROR || 'Failed to fetch products' }
    });
  }
});

export default router;