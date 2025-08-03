

import { useState, useEffect, useMemo } from 'react';
import { getShifts, getSettings, getCurrentUser } from '../api/supabaseApi';

type PeriodType = 'week' | 'month' | 'custom';

const calcFuel = (shift: any, settings: any) => {
  const fuelPrice = Number(settings.fuelPrice) || 0;
  const fuelRate = Number(settings.fuelRate) || 0;
  return (shift.distance * fuelRate / 100) * fuelPrice;
};

const calcSalary = (shift: any, settings: any) => {
  const orderPrice = Number(settings.orderPrice) || 0;
  const minSalaryEnabled = !!settings.minSalaryEnabled;
  const minSalaryDay = Number(settings.minSalaryDay) || 0;
  const minSalaryEvening = Number(settings.minSalaryEvening) || 0;
  const ordersSum = shift.orders * orderPrice;
  
  let salary = ordersSum;
  if (minSalaryEnabled && shift.type) {
    const minSalary = shift.type === 'evening' ? minSalaryEvening : minSalaryDay;
    if (ordersSum < minSalary) {
      salary = minSalary;
    }
  }
  return salary;
};

const calcTotalEarnings = (shift: any, settings: any) => {
  // Общий доход = зарплата + топливо
  return calcSalary(shift, settings) + calcFuel(shift, settings);
};

const Analytics = () => {
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [shifts, setShifts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        if (!user) {
          console.error('Пользователь не авторизован');
          return;
        }

        const [shiftsData, settingsData] = await Promise.all([
          getShifts(user.id),
          getSettings(user.id),
        ]);
        setShifts(shiftsData || []);
        setSettings(settingsData || {});
      } catch (e) {
        console.error('Ошибка загрузки данных:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Вычисляем даты на основе выбранного периода
  const { fromDate, toDate } = useMemo(() => {
    const today = new Date();
    
    if (periodType === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return {
        fromDate: weekAgo.toISOString().split('T')[0],
        toDate: today.toISOString().split('T')[0]
      };
    }
    
    if (periodType === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 30);
      return {
        fromDate: monthAgo.toISOString().split('T')[0],
        toDate: today.toISOString().split('T')[0]
      };
    }
    
    // Для custom используем введенные пользователем даты
    return {
      fromDate: from,
      toDate: to
    };
  }, [periodType, from, to]);

  const filtered = useMemo(() => {
    return shifts.filter(s => {
      if (fromDate && s.date < fromDate) return false;
      if (toDate && s.date > toDate) return false;
      return true;
    });
  }, [shifts, fromDate, toDate]);

  const totalDistance = filtered.reduce((sum, s) => sum + (s.distance || 0), 0);
  const totalOrders = filtered.reduce((sum, s) => sum + (s.orders || 0), 0);
  const totalSalary = filtered.reduce((sum, s) => sum + calcSalary(s, settings), 0);
  const totalFuel = filtered.reduce((sum, s) => sum + calcFuel(s, settings), 0);
  const totalEarnings = filtered.reduce((sum, s) => sum + calcTotalEarnings(s, settings), 0);
  const avgSalary = filtered.length ? totalSalary / filtered.length : 0;
  const avgEarnings = filtered.length ? totalEarnings / filtered.length : 0;
  const avgDistance = filtered.length ? totalDistance / filtered.length : 0;

  if (loading) {
    return <div style={{ color: '#bfc1c7', textAlign: 'center', marginTop: 40 }}>Загрузка...</div>;
  }

  return (
    <div>
      <h2>Аналитика</h2>
      
      {/* Выбор типа периода */}
      <div className="period-selector">
        <button 
          className={periodType === 'week' ? 'period-btn active' : 'period-btn'}
          onClick={() => setPeriodType('week')}
        >
          Неделя
        </button>
        <button 
          className={periodType === 'month' ? 'period-btn active' : 'period-btn'}
          onClick={() => setPeriodType('month')}
        >
          Месяц
        </button>
        <button 
          className={periodType === 'custom' ? 'period-btn active' : 'period-btn'}
          onClick={() => setPeriodType('custom')}
        >
          Период
        </button>
      </div>

      {/* Поля для выбора дат - показываем только при выборе "Период" */}
      {periodType === 'custom' && (
        <div className="date-filters">
          <div className="date-input-group">
            <label>С:</label>
            <input 
              type="date" 
              value={from} 
              onChange={e => setFrom(e.target.value)}
              placeholder="Выберите дату"
            />
          </div>
          <div className="date-input-group">
            <label>По:</label>
            <input 
              type="date" 
              value={to} 
              onChange={e => setTo(e.target.value)}
              placeholder="Выберите дату"
            />
          </div>
        </div>
      )}

      {/* Информация о выбранном периоде */}
      <div className="period-info">
        {periodType === 'week' && <p>📅 Анализ за последние 7 дней</p>}
        {periodType === 'month' && <p>📅 Анализ за последние 30 дней</p>}
        {periodType === 'custom' && fromDate && toDate && (
          <p>📅 Анализ с {fromDate} по {toDate}</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: '#bfc1c7' }}>Нет данных за выбранный период.</p>
      ) : (
        <div className="analytics-card">
          <div style={{ marginBottom: 10 }}>Всего смен: <b>{filtered.length}</b></div>
          <div>Всего заказов: <b>{totalOrders}</b></div>
          <div>Суммарный пробег: <b>{totalDistance.toFixed(2)} км</b></div>
          <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #35363f' }}>
            <div>Чистая зарплата: <b>{totalSalary.toFixed(2)} ₽</b></div>
            <div>Компенсация топлива: <b>{totalFuel.toFixed(2)} ₽</b></div>
            <div style={{ color: '#6c4aff', fontWeight: 'bold' }}>Общий доход: <b>{totalEarnings.toFixed(2)} ₽</b></div>
          </div>
          <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #35363f' }}>
            <div>Средняя зарплата за смену: <b>{avgSalary.toFixed(2)} ₽</b></div>
            <div>Средний общий доход за смену: <b>{avgEarnings.toFixed(2)} ₽</b></div>
            <div>Средний пробег за смену: <b>{avgDistance.toFixed(2)} км</b></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
