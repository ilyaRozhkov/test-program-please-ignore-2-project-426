import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPromoBlocks } from '../api/client';

import './pages_style.css'

interface PromoBlock {
  id: number;
  title: string;
  text: string;
  product: {
    id: number;
    name: string;
    slug: string;
    price: { amount: number };
    imageUrl?: string;
  };
}

export const Home: React.FC = () => {
  const [promos, setPromos] = useState<PromoBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPromoBlocks()
      .then(setPromos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className='home_page_container'>
      <h1 data-testid="app-title" className='home_page_title'>Комплектующие для ПК с доставкой по городу</h1>
      <p className='home_page_sub_title'>Видеокарты, процессоры и материнские платы в наличии. Собираем под задачу, что бы не выбирать из всего каталога сразу.</p>
      <Link to="/catalog" className='home_page_link_catalog'>Перейти в каталог</Link>

      <h2>Выбор магазина</h2>
      {loading && <p>Загрузка...</p>}
      {!loading && promos.length === 0 && <p>Нет активных акций</p>}
      <div data-testid="home-promo" className='main_promo'>
        {promos.map(promo => (
          <Link
            key={promo.id}
            to={`/product/${promo.product.slug}`}
            data-testid="home-promo-item"
            className='no_decorate container-promo'
          >
            <div className='promo_card_container'>
              <div className='promo_card_container_img'>
{promo.product.imageUrl && <img src={promo.product.imageUrl} alt={promo.product.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />}
</div>
          <div className='promo-text'>
            <h3 className='no_decorate'>{promo.title}</h3>
            <p className='no_decorate' style={{color: 'gray'}}>{promo.text}</p>
            <div className='promo_card_bottom'>
              <div className='no_decorate amount'>{promo.product.price.amount} ₽</div>
              <div className='no_decorate bottom_name'>{promo.product.name}</div>
            </div>
            </div>
            </div>

            
          </Link>
        ))}
      </div>
    </div>
  );
};