import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/client';
import { Category, Product } from '../api/types';
import { CatalogCard } from '../components/CatalogCard';

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
    const loadAll = async () => {
      setLoading(true);
      try {
        const data = await getProducts({ limit: 1000 });
        setAllProducts(data.items);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts;

    if (filters.category) {
      result = result.filter(p => p.category.slug === filters.category);
    }
    if (filters.minPrice !== undefined) {
      result = result.filter(p => p.price.amount >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => p.price.amount <= filters.maxPrice!);
    }
    if (filters.available !== undefined) {
      result = result.filter(p => p.available === filters.available);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(searchLower));
    }

    return result;
  }, [allProducts, filters]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / filters.limit);
  const currentPage = Math.min(filters.page, totalPages) || 1;
  const startIndex = (currentPage - 1) * filters.limit;
  const endIndex = Math.min(startIndex + filters.limit, totalItems);
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const updateFilter = useCallback((key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === undefined || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const resetFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const changePage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateFilter('page', newPage);
    }
  }, [updateFilter, totalPages]);

  const categories = useMemo(() => {
    const map = new Map();
    allProducts.forEach(p => {
      if (!map.has(p.category.slug)) {
        map.set(p.category.slug, p.category);
      }
    });
    return Array.from(map.values());
  }, [allProducts]);

  return (
    <div className='catalog-container'>
      <aside className='catalog-container-aside'>
        <div data-testid="catalog-filters" className='catalog-filters'>
          <div className='search-container'>
            <p className='search-container-text'>Категория</p>
            <div className='input-field'>
              <select
                data-testid="filter-category"
                className='catalog_input'
                value={filters.category}
                onChange={e => updateFilter('category', e.target.value)}
                style={{width: '100%'}}
              >
                <option value="">-</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className='search-container'>
            <p className='search-container-text'>Название</p>
            <div className='input-field'>
              <input
                data-testid="filter-search"
                style={{width: '87%'}}
                className='catalog_input'
                type="text"
                value={filters.search || ''}
                placeholder='Например, RTX'
                onChange={e => updateFilter('search', e.target.value)}
              />
            </div>
          </div>
          <div className='search-container'>
            <p className='search-container-text'>Цена от, ₽</p>
            <div className='input-field'>
              <input
                data-testid="filter-price-min"
                style={{width: '87%'}}
                className='catalog_input'
                type="number"
                value={filters.minPrice || ''}
                placeholder='0'
                onChange={e => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
          <div className='search-container'>
            <p className='search-container-text'>Цена до, ₽</p>
            <div className='input-field'>
              <input
                data-testid="filter-price-max"
                type="number"
                style={{width: '87%'}}
                className='catalog_input'
                value={filters.maxPrice || ''}
                placeholder='200 000'
                onChange={e => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
          <label className='search-container-text' style={{marginTop: '6px'}}>
            <input
              data-testid="filter-available"
              type="checkbox"
              checked={filters.available || false}
              onChange={e => updateFilter('available', e.target.checked)}
            /> Только в наличии
          </label>
          <button data-testid="filter-reset" onClick={resetFilters} className='button-reset'>Сбросить</button>
        </div>
      </aside>
      <main style={{ flex: 3 }}>
        {loading && <p>Загрузка...</p>}
        {!loading && totalItems === 0 && (
          <div data-testid="catalog-empty">Ничего не найдено</div>
        )}
        {!loading && totalItems > 0 && (
          <>
            <div className='catalog-data-container' data-testid="catalog-list">
              <div className='catalog-data-title'>Комплектующие для ПК</div>
              <div className='catalog-data-sub-title'>
                Видеокарты, процессоры и материнские платы - с фильтрами по категориям, цене и наличию.
              </div>
              <div className='catalog-data-length'>
                {`Найдено товаров: ${totalItems}`}
              </div>
              <div className='catalog-data-card-container'>
                {currentProducts.map((p) => (
                  <CatalogCard key={p.id} data={p} />
                ))}
              </div>
            </div>
            <div data-testid="catalog-pagination">
              <button
                data-testid="catalog-page-prev"
                disabled={currentPage <= 1}
                onClick={() => changePage(currentPage - 1)}
              >
                Назад
              </button>
              <span>Страница {currentPage} из {totalPages}</span>
              <button
                data-testid="catalog-page-next"
                disabled={currentPage >= totalPages}
                onClick={() => changePage(currentPage + 1)}
              >
                Вперёд
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
