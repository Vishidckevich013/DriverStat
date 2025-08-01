

import { useEffect, useState } from 'react';
import { getShifts, clearShifts, getSettings, getCurrentUser } from '../api/supabaseApi';

const Shifts = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ orderPrice: 100, fuelPrice: 60, fuelRate: 10 });
  const [loading, setLoading] = useState(true);
  const [clearLoading, setClearLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        if (!user) {
          console.error('Пользователь не авторизован');
          return;
        }
        setUserId(user.id);

        const [shiftsData, settingsData] = await Promise.all([
          getShifts(user.id),
          getSettings(user.id),
        ]);
        setShifts(shiftsData || []);
        setSettings(settingsData || {});
      } catch (e) {
        alert('Ошибка загрузки данных!');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClear = async () => {
    if (!userId) {
      alert('Ошибка: пользователь не авторизован');
      return;
    }
    
    setClearLoading(true);
    try {
      await clearShifts(userId);
      setShifts([]);
    } catch (e) {
      alert('Ошибка при очистке истории!');
    } finally {
      setClearLoading(false);
    }
  };

  const calcFuel = (shift: any) => {
    const fuelPrice = Number(settings.fuelPrice) || 0;
    const fuelRate = Number(settings.fuelRate) || 0;
    return (shift.distance * fuelRate / 100) * fuelPrice;
  };

  const calcEarnings = (shift: any) => {
    const orderPrice = Number(settings.orderPrice) || 0;
    const minSalaryEnabled = !!settings.minSalaryEnabled;
    const minSalaryDay = Number(settings.minSalaryDay) || 0;
    const minSalaryEvening = Number(settings.minSalaryEvening) || 0;

    const ordersSum = shift.orders * orderPrice;
    const fuelCost = calcFuel(shift);

    let salary = ordersSum;
    if (minSalaryEnabled && shift.type) {
      const minSalary = shift.type === 'evening' ? minSalaryEvening : minSalaryDay;
      if (ordersSum < minSalary) {
        salary = minSalary;
      }
    }
    salary = salary + fuelCost;
    return salary;
  };

  if (loading) {
    return <div style={{ color: '#bfc1c7', textAlign: 'center', marginTop: 40 }}>Загрузка...</div>;
  }
  return (
    <div>
      <h2>Все смены</h2>
      <button onClick={handleClear} disabled={clearLoading} style={{ marginBottom: 16, background: '#35363f', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 16px', cursor: 'pointer' }}>
        {clearLoading ? 'Очищаю...' : 'Очистить историю'}
      </button>
      {shifts.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p style={{ color: '#bfc1c7', fontSize: '1.1em' }}>Нет данных о сменах.<br/>Чтобы появилась информация, добавьте хотя бы одну смену.</p>
          <a href="/add" style={{ display: 'inline-block', marginTop: 16 }}>
            <button style={{ background: '#6c4aff', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 22px', fontSize: '1em', cursor: 'pointer' }}>
              Добавить смену
            </button>
          </a>
        </div>
      ) : (
        <table style={{ width: '100%', background: '#23284a', borderRadius: 12, padding: 8, color: '#fff', marginTop: 16 }}>
          <thead>
            <tr>
              <th>Дата</th>
              {settings.minSalaryEnabled && <th>Тип</th>}
              <th>Заказы</th>
              <th>Пробег (км)</th>
              <th>Топливо (₽)</th>
              <th>Оплата за заказы (₽)</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, i) => (
              <tr key={i} style={{ textAlign: 'center' }}>
                <td>{shift.date}</td>
                {settings.minSalaryEnabled && <td>{shift.type === 'evening' ? 'Вечерняя' : 'Дневная'}</td>}
                <td>{shift.orders}</td>
                <td>{shift.distance}</td>
                <td>{calcFuel(shift).toFixed(2)}</td>
                <td>{calcEarnings(shift).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Shifts;
