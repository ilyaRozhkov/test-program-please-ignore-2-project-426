import { Router } from 'express';
import Ajv from 'ajv';
import { schema } from '../validation.ts';

import { prisma } from '../db/client';
import { getCategories, getProducts, getProductBySlug, CatalogError } from '../services/catalog.service';

const router = Router();

const ajv = new Ajv({
  coerceTypes: true,
  removeAdditional: true,
  strict: false, 
});

const productsArgsSchema = schema['/api/catalog/products']?.GET?.args;
if (!productsArgsSchema) {
  throw new Error('Products schema not found in validation');
}
const validateProductsQuery = ajv.compile(productsArgsSchema);

const getNumber = (value: any): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

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
    const valid = validateProductsQuery({ query: req.query });
    if (!valid) {
      const errors = validateProductsQuery.errors?.map(e => e.message).join(', ') || 'Invalid query parameters';
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: errors }
      });
    }

    const q = req.query;
    const params = {
      category: typeof q.category === 'string' ? q.category : undefined,
      minPrice: getNumber(q.minPrice),
      maxPrice: getNumber(q.maxPrice),
      available: q.available === 'true' ? true : q.available === 'false' ? false : undefined,
      search: typeof q.search === 'string' ? q.search : undefined,
      page: getNumber(q.page) || 1,
      limit: Math.min(getNumber(q.limit) || 10, 100),
    };

    const result = await getProducts(params);
    res.json(result);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

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
