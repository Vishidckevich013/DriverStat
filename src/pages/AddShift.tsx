

import { useState, useEffect } from 'react';
import { addShift, getCurrentUser, getSettings } from '../api/supabaseApi';
import NotificationModal from '../components/NotificationModal';

const AddShift = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [orders, setOrders] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [type, setType] = useState<'day' | 'evening'>('day');
  const [success, setSuccess] = useState(false);
  const [minSalaryEnabled, setMinSalaryEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [initLoading, setInitLoading] = useState(true);
  
  // Состояния для модальных окон
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ title: '', message: '', type: 'info' as any });

  useEffect(() => {
    const initUser = async () => {
      try {
        console.log('AddShift: Получаем текущего пользователя...');
        const user = await getCurrentUser();
        if (user) {
          console.log('AddShift: Пользователь найден:', user.id);
          setUserId(user.id);
          
          // Получаем настройки пользователя
          console.log('AddShift: Получаем настройки...');
          const settings = await getSettings(user.id);
          console.log('AddShift: Настройки:', settings);
          
          if (settings && settings.minSalaryEnabled) {
            setMinSalaryEnabled(true);
          } else {
            setMinSalaryEnabled(false);
          }
        } else {
          console.error('AddShift: Пользователь не найден');
        }
      } catch (error) {
        console.error('AddShift: Ошибка получения пользователя или настроек:', error);
      } finally {
        setInitLoading(false);
      }
    };
    
    initUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setNotification({
        title: 'Ошибка авторизации',
        message: 'Пользователь не авторизован',
        type: 'error'
      });
      setShowNotification(true);
      return;
    }
    
    setLoading(true);
    try {
      console.log('AddShift: Добавляем смену для пользователя:', userId);
      const shiftData = {
        date,
        orders: Number(orders.replace(/^0+(?![.,]|$)/, '')),
        distance: Number(distance.replace(/^0+(?![.,]|$)/, '')),
        type: minSalaryEnabled ? type : undefined,
      };
      console.log('AddShift: Данные смены:', shiftData);
      
      await addShift(userId, shiftData);
      console.log('AddShift: Смена успешно добавлена');
      
      setSuccess(true);
      setOrders('');
      setDistance('');
      setDate(new Date().toISOString().slice(0, 10));
      setTimeout(() => setSuccess(false), 2000);
      
      setNotification({
        title: 'Успешно!',
        message: 'Смена успешно добавлена',
        type: 'success'
      });
      setShowNotification(true);
    } catch (err) {
      console.error('AddShift: Ошибка при добавлении смены:', err);
      console.error('AddShift: Детали ошибки:', {
        message: (err as any).message,
        details: (err as any).details,
        hint: (err as any).hint,
        code: (err as any).code
      });
      setNotification({
        title: 'Ошибка добавления',
        message: `Ошибка при добавлении смены: ${(err as any).message || 'Неизвестная ошибка'}`,
        type: 'error'
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return <div style={{ color: '#bfc1c7', textAlign: 'center', marginTop: 40 }}>Загрузка...</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 340, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label>
        Дата смены:
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </label>
      <label>
        Кол-во заказов:
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={orders}
          onChange={e => setOrders(e.target.value.replace(/^0+(?![.,]|$)/, ''))}
          required
        />
      </label>
      <label>
        Пробег (км):
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          value={distance}
          onChange={e => setDistance(e.target.value.replace(/^0+(?![.,]|$)/, ''))}
          required
        />
      </label>
      {minSalaryEnabled && (
        <label>
          Тип смены:
          <select value={type} onChange={e => setType(e.target.value as 'day' | 'evening')} style={{ padding: '8px', borderRadius: 7, border: '1.5px solid #35363f', background: '#23262e', color: '#f3f4f6', fontSize: '1.08em' }}>
            <option value="day">Дневная</option>
            <option value="evening">Вечерняя</option>
          </select>
        </label>
      )}
      <button type="submit" disabled={loading}>{loading ? 'Сохраняю...' : 'Сохранить смену'}</button>
      {success && <div style={{ color: '#6c4aff', marginTop: 8 }}>Смена добавлена!</div>}
      
      <div style={{ 
        marginTop: 20, 
        padding: 12, 
        background: '#2a2f3a', 
        borderRadius: 8, 
        border: '1px solid #35363f',
        textAlign: 'center'
      }}>
        <p style={{ 
          color: '#bfc1c7', 
          fontSize: '0.9em', 
          margin: '0 0 8px 0',
          opacity: 0.8
        }}>
          Можете изменить тарифы и настройки расчетов
        </p>
        <button
          type="button"
          onClick={() => window.location.hash = 'settings'}
          style={{
            background: 'transparent',
            color: '#6c4aff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9em',
            textDecoration: 'underline',
            padding: 0
          }}
        >
          Перейти в настройки
        </button>
      </div>

      {/* Модальное окно уведомлений */}
      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </form>
  );
};

export default AddShift;
