

import { useState, useEffect } from 'react';
import { addShift, getCurrentUser, getSettings } from '../api/supabaseApi';

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
      alert('Ошибка: пользователь не авторизован');
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
    } catch (err) {
      console.error('AddShift: Ошибка при добавлении смены:', err);
      alert('Ошибка при добавлении смены!');
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
    </form>
  );
};

export default AddShift;
