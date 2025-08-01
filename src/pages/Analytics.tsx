

import { useState, useEffect, useMemo } from 'react';
import { getShifts, getSettings, getCurrentUser } from '../api/supabaseApi';

const calcFuel = (shift: any, settings: any) => {
  const fuelPrice = Number(settings.fuelPrice) || 0;
  const fuelRate = Number(settings.fuelRate) || 0;
  return (shift.distance * fuelRate / 100) * fuelPrice;
};

const calcEarnings = (shift: any, settings: any) => {
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
  salary = salary + calcFuel(shift, settings);
  return salary;
};

const Analytics = () => {
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

  const filtered = useMemo(() => {
    return shifts.filter(s => {
      if (from && s.date < from) return false;
      if (to && s.date > to) return false;
      return true;
    });
  }, [shifts, from, to]);

  const totalDistance = filtered.reduce((sum, s) => sum + (s.distance || 0), 0);
  const totalEarnings = filtered.reduce((sum, s) => sum + calcEarnings(s, settings), 0);
  const totalFuel = filtered.reduce((sum, s) => sum + calcFuel(s, settings), 0);
  const avgEarnings = filtered.length ? totalEarnings / filtered.length : 0;
  const avgDistance = filtered.length ? totalDistance / filtered.length : 0;

  if (loading) {
    return <div style={{ color: '#bfc1c7', textAlign: 'center', marginTop: 40 }}>Загрузка...</div>;
  }

  return (
    <div>
      <h2>Аналитика</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <label>
          С:
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <label>
          По:
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </label>
      </div>
      {filtered.length === 0 ? (
        <p style={{ color: '#bfc1c7' }}>Нет данных за выбранный период.</p>
      ) : (
        <div style={{ background: '#23284a', borderRadius: 12, padding: 20, color: '#fff', maxWidth: 400, margin: '0 auto' }}>
          <div style={{ marginBottom: 10 }}>Всего смен: <b>{filtered.length}</b></div>
          <div>Суммарный пробег: <b>{totalDistance.toFixed(2)} км</b></div>
          <div>Суммарный заработок: <b>{totalEarnings.toFixed(2)} ₽</b></div>
          <div>Сумма за топливо: <b>{totalFuel.toFixed(2)} ₽</b></div>
          <div>Средний заработок за смену: <b>{avgEarnings.toFixed(2)} ₽</b></div>
          <div>Средний пробег за смену: <b>{avgDistance.toFixed(2)} км</b></div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
