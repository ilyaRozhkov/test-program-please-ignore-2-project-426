import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../api/types';
import { useCart } from '../contexts/CartContext';

interface CatalogCardProps {
  data: Product;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({ data }) => {
  const { addItem } = useCart();

    const handleAddToCart = () => {
    if (data && data.available) {
      addItem(data.id, 1);
      alert('Товар добавлен в корзину!');
    }
  };
    return (
        <div className="container-card" data-testid="catalog-item">
            <div className='container-card-img'>
<img src={data.imageUrl} alt={data.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />

            </div>
            <div className='container-card-text'>
                <Link  to={`/product/${data.slug}`}>
                <div className='container-card-text-title' data-testid="catalog-item-name">{data.name}</div></Link>
                <div className='container-card-text-sub-title'>{data.description}</div>
                <div className='container-card-text-bottom'>
                    <div className='container-card-text-bottom-price' data-testid="catalog-item-price">{`${data.price.amount} ₽`}</div>
                    {data.available ? 
                    <div className='container-card-text-bottom-available' data-testid="catalog-item-availability" data-available='true'>В наличии</div>
                     : <div className='container-card-text-bottom-not-available' data-testid="catalog-item-availability" data-available='false'>Нет в наличии</div>
                     }
                </div>
                <div className='link-to-item' onClick={handleAddToCart}>В корзину</div>
            </div>

        </div>
    )
}
