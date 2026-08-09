import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductBySlug } from '../api/client';
import { useCart } from '../contexts/CartContext';
import './pages_style.css'

export const Product: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (product && product.available) {
      addItem(product.id, 1);
      alert('Товар добавлен в корзину!');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!product) return <div>Товар не найден</div>;

  return (
    <div className='product_container'>
      <div className='product_img'>
        <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '400px' }} />
      </div>
      <div className='product_info'>
        <div className='product_info_title'>{product.name}</div>
        <div 
        className={`${product.available ? 'product_info_available': 'product_info_not_available'}`}
        >{product.available ? 'В наличии' : 'Нет в наличии'}</div>
        <div className='product_info_description'>{product.description}</div>
        <div className='product_info_order'>
        <div className='product_info_price'>{product.price.amount} ₽</div>
        <button
        data-testid="product-add-to-cart"
        onClick={handleAddToCart}
        disabled={!product.available}
        className='product_info_btn'
      >
        {product.available ? 'В корзину' : 'Недоступен'}
      </button>
      </div>
      </div>
    </div>

  );
};
