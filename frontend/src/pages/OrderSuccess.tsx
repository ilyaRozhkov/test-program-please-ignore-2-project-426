import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/');
      return;
    }
    clearCart();
  }, [order, navigate, clearCart]);

  if (!order) {
    return null;
  }

  return (
    <div data-testid="order-success">
      <h2>Заказ успешно оформлен!</h2>
      <p>Номер заказа: #{order.id}</p>
      <div>
        <h3>Состав заказа</h3>
        {order.items.map((item: any) => (
          <div key={item.id}>
            {item.name} × {item.quantity} = {item.price.amount * item.quantity} ₽
          </div>
        ))}
      </div>
      <div data-testid="order-total">
        <strong>Итого: {order.total} ₽</strong>
      </div>
      <button onClick={() => navigate('/account')}>Перейти в личный кабинет</button>
    </div>
  );
};
