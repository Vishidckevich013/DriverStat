

import { useState, useEffect } from 'react';
import { addShift, getCurrentUser } from '../api/supabaseApi';

const AddShift = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [orders, setOrders] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [type, setType] = useState<'day' | 'evening'>('day');
  const [success, setSuccess] = useState(false);
  const [minSalaryEnabled, setMinSalaryEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Ошибка получения пользователя:', error);
      }
    };
    
    initUser();
    
    // Для простоты: localStorage fallback, но лучше получать из Supabase
    const s = JSON.parse(localStorage.getItem('settings') || 'null');
    if (s && s.minSalaryEnabled) setMinSalaryEnabled(true);
    else setMinSalaryEnabled(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Ошибка: пользователь не авторизован');
      return;
    }
    
    setLoading(true);
    try {
      await addShift(userId, {
        date,
        orders: Number(orders.replace(/^0+(?![.,]|$)/, '')),
        distance: Number(distance.replace(/^0+(?![.,]|$)/, '')),
        type: minSalaryEnabled ? type : undefined,
      });
      setSuccess(true);
      setOrders('');
      setDistance('');
      setDate(new Date().toISOString().slice(0, 10));
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert('Ошибка при добавлении смены!');
    } finally {
      setLoading(false);
    }
  };

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
