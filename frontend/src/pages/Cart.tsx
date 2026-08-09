import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getProductsByIds } from '../api/client';

interface CartItemWithDetails {
  productId: number;
  quantity: number;
  name: string;
  price: { amount: number };
  available: boolean;
  slug: string;
  imageUrl?: string;
}

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    const ids = items.map(i => i.productId);
    getProductsByIds(ids)
      .then(products => {
        const merged = items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            name: product ? product.name : 'Товар не найден',
            price: product ? product.price : { amount: 0 },
            available: product ? product.available : false,
            slug: product ? product.slug : '',
            imageUrl: product?.imageUrl,
          };
        });
        setCartItems(merged);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [items]);

  const total = cartItems.reduce((sum, item) => sum + item.price.amount * item.quantity, 0);

  if (loading) return <div>Загрузка...</div>;

  if (cartItems.length === 0) {
    return (
      <div data-testid="cart-empty">
        <h2>Корзина пуста</h2>
        <Link to="/catalog">Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Корзина</h2>
      {cartItems.map(item => (
        <div key={item.productId} data-testid="cart-item" style={{ border: '1px solid #ccc', padding: '1rem', margin: '0.5rem 0' }}>
          <div>{item.name}</div>
          <div>{item.price.amount} ₽</div>
          <div>
            <label>Количество:</label>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
              data-testid="cart-item-qty"
            />
          </div>
          <button onClick={() => removeItem(item.productId)} data-testid="cart-item-remove">Удалить</button>
        </div>
      ))}
      <div data-testid="cart-total">
        <strong>Итого: {total} ₽</strong>
      </div>
      <Link to="/checkout" data-testid="cart-checkout">Оформить заказ</Link>
      <button onClick={clearCart}>Очистить корзину</button>
    </div>
  );
};