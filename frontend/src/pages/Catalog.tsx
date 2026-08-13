import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api/client';
import { Category, Product } from '../api/types';
import { CatalogCard } from '../components/CatalogCard';

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const filters = useMemo(() => ({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    available: searchParams.get('available') === 'true' ? true : undefined,
    search: searchParams.get('search') || '',
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
  }), [searchParams]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const load = async () => {
      try {
        const params: any = {};
        if (filters.category) params.category = filters.category;
        if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
        if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
        if (filters.available !== undefined) params.available = filters.available;
        if (filters.search) params.search = filters.search;
        if (filters.page) params.page = filters.page;
        if (filters.limit) params.limit = filters.limit;
        const data = await getProducts(params, { signal: controller.signal });
        setProducts(data.items);
        setPagination({ total: data.total, page: data.page, limit: data.limit, totalPages: data.totalPages });
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(load, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [filters]);

  const updateFilter = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === undefined || value === false) newParams.delete(key);
    else newParams.set(key, String(value));
    setSearchParams(newParams);
  };

  const resetFilters = () => setSearchParams({});
  const changePage = (newPage: number) => updateFilter('page', newPage);

  return (
    <div className='catalog-container'>
      <aside className='catalog-container-aside'>
        <div data-testid="catalog-filters" className='catalog-filters'>
          <div className='search-container'>
            <p className='search-container-text'>Категория</p>
            <div className='input-field'>
              <select data-testid="filter-category" className='catalog_input' value={filters.category} onChange={e => updateFilter('category', e.target.value)} style={{width: '100%'}}>
                <option value="">-</option>
                {categories.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className='search-container'>
            <p className='search-container-text'>Название</p>
            <div className='input-field'>
              <input data-testid="filter-search" style={{width: '87%'}} className='catalog_input' type="text" value={filters.search || ''} placeholder='Например, RTX' onChange={e => updateFilter('search', e.target.value)} />
            </div>
          </div>
          <div className='search-container'>
            <p className='search-container-text'>Цена от, ₽</p>
            <div className='input-field'>
              <input data-testid="filter-price-min" style={{width: '87%'}} className='catalog_input' type="number" value={filters.minPrice || ''} placeholder='0' onChange={e => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </div>
          <div className='search-container'>
            <p className='search-container-text'>Цена до, ₽</p>
            <div className='input-field'>
              <input data-testid="filter-price-max" type="number" style={{width: '87%'}} className='catalog_input' value={filters.maxPrice || ''} placeholder='200 000' onChange={e => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </div>
          <label className='search-container-text' style={{marginTop: '6px'}}>
            <input data-testid="filter-available" type="checkbox" checked={filters.available || false} onChange={e => updateFilter('available', e.target.checked)} /> Только в наличии
          </label>
          <button data-testid="filter-reset" onClick={resetFilters} className='button-reset'>Сбросить</button>
        </div>
      </aside>
      <main style={{ flex: 3 }}>
        {loading && <p>Загрузка...</p>}
        {!loading && products.length === 0 && <div data-testid="catalog-empty">Ничего не найдено</div>}
        {!loading && products.length > 0 && (
          <>
            <div className='catalog-data-container' data-testid="catalog-list">
              <div className='catalog-data-title'>Комплектующие для ПК</div>
              <div className='catalog-data-sub-title'>Видеокарты, процессоры и материнские платы - с фильтрами по категориям, цене и наличию.</div>
              <div className='catalog-data-length'>
                {`Найдено товаров: ${products.length}`}
              </div>
              <div className='catalog-data-card-container'>
                {products.map((p: any) => (
                  <CatalogCard key={p.id} data={p} />
                ))}
              </div>
            </div>
            <div data-testid="catalog-pagination">
              <button data-testid="catalog-page-prev" disabled={pagination.page <= 1} onClick={() => changePage(pagination.page - 1)}>Назад</button>
              <span>Страница {pagination.page} из {pagination.totalPages}</span>
              <button data-testid="catalog-page-next" disabled={pagination.page >= pagination.totalPages} onClick={() => changePage(pagination.page + 1)}>Вперёд</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
