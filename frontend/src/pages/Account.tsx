import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMyOrders } from '../api/client';
import { Order } from '../api/types';

export const Account: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    getMyOrders(token!)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Личный кабинет</h2>
      {orders.length === 0 ? (
        <div data-testid="account-orders-empty">У вас пока нет заказов</div>
      ) : (
        <div data-testid="account-orders">
          {orders.map(order => (
            <div key={order.id} data-testid="account-order-item" style={{ border: '1px solid #ddd', padding: '1rem', margin: '1rem 0' }}>
              <div>Заказ #{order.id}</div>
              <div data-testid="order-status" data-status={order.status}>Статус: {order.status}</div>
              <div>Дата: {new Date(order.createdAt).toLocaleDateString()}</div>
              <div data-testid="order-total">Сумма: {order.total} ₽</div>
              <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} data-testid="order-details-toggle">
                {expandedOrder === order.id ? 'Скрыть детали' : 'Показать детали'}
              </button>
              {expandedOrder === order.id && (
                <div>
                  {order.items.map((item, idx) => (
                    <div key={idx} data-testid="order-item">
                      {item.name} × {item.quantity} = {item.price.amount * item.quantity} ₽
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
