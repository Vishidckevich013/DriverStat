

import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../api/supabaseApi';

const getUserId = () => {
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 'test_user';
};

const defaultSettings = {
  orderPrice: 100,
  fuelPrice: 60,
  fuelRate: 10,
  minSalaryEnabled: false,
  minSalaryDay: 65,
  minSalaryEvening: 35,
};

const Settings = () => {
  const [orderPrice, setOrderPrice] = useState<string>(defaultSettings.orderPrice.toString());
  const [fuelPrice, setFuelPrice] = useState<string>(defaultSettings.fuelPrice.toString());
  const [fuelRate, setFuelRate] = useState<string>(defaultSettings.fuelRate.toString());
  const [minSalaryEnabled, setMinSalaryEnabled] = useState<boolean>(false);
  const [minSalaryDay, setMinSalaryDay] = useState<string>(defaultSettings.minSalaryDay.toString());
  const [minSalaryEvening, setMinSalaryEvening] = useState<string>(defaultSettings.minSalaryEvening.toString());
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const s = await getSettings(getUserId());
        if (s) {
          setOrderPrice(s.orderPrice?.toString() ?? defaultSettings.orderPrice.toString());
          setFuelPrice(s.fuelPrice?.toString() ?? defaultSettings.fuelPrice.toString());
          setFuelRate(s.fuelRate?.toString() ?? defaultSettings.fuelRate.toString());
          setMinSalaryEnabled(!!s.minSalaryEnabled);
          setMinSalaryDay(s.minSalaryDay?.toString() ?? defaultSettings.minSalaryDay.toString());
          setMinSalaryEvening(s.minSalaryEvening?.toString() ?? defaultSettings.minSalaryEvening.toString());
        }
      } catch (e) {
        // fallback: ничего не делаем, оставляем дефолт
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveSettings(getUserId(), {
        orderPrice: parseFloat(orderPrice.replace(',', '.')),
        fuelPrice: parseFloat(fuelPrice.replace(',', '.')),
        fuelRate: parseFloat(fuelRate.replace(',', '.')),
        minSalaryEnabled,
        minSalaryDay: parseFloat(minSalaryDay.replace(',', '.')),
        minSalaryEvening: parseFloat(minSalaryEvening.replace(',', '.')),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Ошибка при сохранении настроек!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#bfc1c7', textAlign: 'center', marginTop: 40 }}>Загрузка...</div>;
  }
  return (
    <div>
      <h2>Настройки</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 340, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label>
          Стоимость за заказ (₽):
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={orderPrice}
            onChange={e => setOrderPrice(e.target.value.replace(/^0+(?![.,]|$)/, ''))}
            required
          />
        </label>
        <label>
          Стоимость топлива (₽/л):
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={fuelPrice}
            onChange={e => setFuelPrice(e.target.value.replace(/^0+(?![.,]|$)/, ''))}
            required
          />
        </label>
        <label>
          Расход топлива (л/100км):
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={fuelRate}
            onChange={e => setFuelRate(e.target.value.replace(/^0+(?![.,]|$)/, ''))}
            required
          />
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={minSalaryEnabled}
            onChange={e => setMinSalaryEnabled(e.target.checked)}
            id="minSalaryEnabled"
          />
          <label htmlFor="minSalaryEnabled" style={{ margin: 0, color: '#bfc1c7', fontWeight: 500, cursor: 'pointer' }}>
            Включить минимальную зарплату
          </label>
        </div>
        {minSalaryEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
            <label>
              Мин. дневная зарплата
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={minSalaryDay}
                onChange={e => setMinSalaryDay(e.target.value.replace(/^0+(?![.,]|$)/, ''))}
                required
              />
            </label>
            <label>
              Мин. вечерняя зарплата
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={minSalaryEvening}
                onChange={e => setMinSalaryEvening(e.target.value.replace(/^0+(?![.,]|$)/, ''))}
                required
              />
            </label>
          </div>
        )}
        <button type="submit" disabled={loading}>{loading ? 'Сохраняю...' : 'Сохранить'}</button>
        {saved && <div style={{ color: '#6c4aff', marginTop: 8 }}>Настройки сохранены!</div>}
      </form>
    </div>
  );
};

export default Settings;
