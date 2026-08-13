import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getProductsByIds, createOrder } from '../api/client';
import { Product, CreateOrderRequest } from '../api/types';
import './pages_style.css'

export const Checkout: React.FC = () => {
  const { items, clearCart, refreshCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartDetails, setCartDetails] = useState<any[]>([]);

  useEffect(() => {
    refreshCart();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    const ids = items.map(i => i.productId);
    getProductsByIds(ids)
      .then((products: Product[]) => {
        const merged = items.map(item => ({
          ...item,
          ...products.find(p => p.id === item.productId),
        }));
        setCartDetails(merged);
      })
      .catch(console.error);
  }, [items, navigate]);

  const total = cartDetails.reduce((sum, item) => sum + (item.price?.amount || 0) * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      refreshCart();
      const stored = localStorage.getItem('cart');
      let cartItems = items;
      if (stored) {
        try {
          cartItems = JSON.parse(stored);
        } catch {}
      }
      
      const orderData: CreateOrderRequest = {
        items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        deliveryMethod,
        recipientName,
        phone,
        address: deliveryMethod === 'delivery' ? address : undefined,
      };
      const result = await createOrder(orderData, token!);
      clearCart();
      navigate('/order-success', { state: { order: result.order } });
    } catch (err: any) {
      setError(err.message || 'Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={'checkout_order'}>
      <h2>Оформление заказа</h2>
      <form onSubmit={handleSubmit} data-testid="checkout-form" className='checkout_form'>
        <div className='checkout_form_item'>
          <label>Способ получения:</label>
          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value as any)}
            data-testid="checkout-method"
          >
            <option value="delivery">Доставка</option>
            <option value="pickup">Самовывоз</option>
          </select>
        </div>
        <div className='checkout_form_item'>
          <label>Имя получателя:</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            required
            data-testid="checkout-name"
          />
        </div>
        <div className='checkout_form_item'>
          <label>Телефон:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            data-testid="checkout-phone"
          />
        </div>
        {deliveryMethod === 'delivery' && (
          <div className='checkout_form_item'>
            <label>Адрес доставки:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              data-testid="checkout-address"
            />
          </div>
        )}
        <div className='checkout_form_item'>
          <strong>Сумма: {total} ₽</strong>
        </div>
        {error && <div style={{ color: 'red' }} data-testid="order-error">{error}</div>}
        <button type="submit" disabled={loading} data-testid="checkout-submit">
          {loading ? 'Оформление...' : 'Оформить заказ'}
        </button>
      </form>
    </div>
  );
};
