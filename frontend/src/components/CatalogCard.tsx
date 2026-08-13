import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../api/types';

interface CatalogCardProps {
  data: Product;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({ data }) => {

    return (
        <div className="container-card" data-testid="catalog-item">
            <div className='container-card-img'>
<img src={data.imageUrl} alt={data.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />

            </div>
            <div className='container-card-text'>
                <div className='container-card-text-title' data-testid="catalog-item-name">{data.name}</div>
                <div className='container-card-text-sub-title'>{data.description}</div>
                <div className='container-card-text-bottom'>
                    <div className='container-card-text-bottom-price' data-testid="catalog-item-price">{`${data.price.amount} ₽`}</div>
                    {data.available ? 
                    <div className='container-card-text-bottom-available'data-testid="catalog-item-availability" data-availability='true'>В наличии</div>
                     : <div className='container-card-text-bottom-not-available' data-availability='false'>Отсутствует</div>
                     }
                </div>
                <Link className='link-to-item' to={`/product/${data.slug}`}>К товару</Link>
            </div>

        </div>
    )
}
