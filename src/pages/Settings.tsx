

import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, getCurrentUser, checkDatabaseTables, refreshSupabaseSchema } from '../api/supabaseApi';
import NotificationModal from '../components/NotificationModal';

interface SettingsProps {
  onLogout: () => void;
}

const defaultSettings = {
  orderPrice: 100,
  fuelPrice: 60,
  fuelRate: 10,
  minSalaryEnabled: false,
  minSalaryDay: 65,
  minSalaryEvening: 35,
};

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [orderPrice, setOrderPrice] = useState<string>(defaultSettings.orderPrice.toString());
  const [fuelPrice, setFuelPrice] = useState<string>(defaultSettings.fuelPrice.toString());
  const [fuelRate, setFuelRate] = useState<string>(defaultSettings.fuelRate.toString());
  const [minSalaryEnabled, setMinSalaryEnabled] = useState<boolean>(false);
  const [minSalaryDay, setMinSalaryDay] = useState<string>(defaultSettings.minSalaryDay.toString());
  const [minSalaryEvening, setMinSalaryEvening] = useState<string>(defaultSettings.minSalaryEvening.toString());
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [diagLoading, setDiagLoading] = useState(false);
  
  // Состояния для модальных окон
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ title: '', message: '', type: 'info' as any });
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        if (!user) {
          onLogout();
          return;
        }
        setUserId(user.id);

        const s = await getSettings(user.id);
        if (s) {
          setOrderPrice(s.orderPrice?.toString() ?? defaultSettings.orderPrice.toString());
          setFuelPrice(s.fuelPrice?.toString() ?? defaultSettings.fuelPrice.toString());
          setFuelRate(s.fuelRate?.toString() ?? defaultSettings.fuelRate.toString());
          setMinSalaryEnabled(!!s.minSalaryEnabled);
          setMinSalaryDay(s.minSalaryDay?.toString() ?? defaultSettings.minSalaryDay.toString());
          setMinSalaryEvening(s.minSalaryEvening?.toString() ?? defaultSettings.minSalaryEvening.toString());
        }
      } catch (e) {
        console.error('Ошибка загрузки настроек:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [onLogout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const settingsData = {
      orderPrice: parseFloat(orderPrice.replace(',', '.')),
      fuelPrice: parseFloat(fuelPrice.replace(',', '.')),
      fuelRate: parseFloat(fuelRate.replace(',', '.')),
      minSalaryEnabled,
      minSalaryDay: parseFloat(minSalaryDay.replace(',', '.')),
      minSalaryEvening: parseFloat(minSalaryEvening.replace(',', '.')),
    };
    
    console.log('Settings: Отправляем настройки на сохранение:', settingsData);
    console.log('Settings: ID пользователя:', userId);
    
    try {
      await saveSettings(userId, settingsData);
      console.log('Settings: Настройки успешно сохранены');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Settings: Ошибка при сохранении настроек:', e);
      setNotification({
        title: 'Ошибка сохранения',
        message: `Ошибка при сохранении настроек: ${(e as Error).message}`,
        type: 'error'
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnose = async () => {
    setDiagLoading(true);
    try {
      await checkDatabaseTables();
      console.log('Диагностика завершена. Проверьте консоль для деталей.');
      setNotification({
        title: 'Диагностика завершена',
        message: 'Диагностика завершена. Проверьте консоль браузера (F12) для деталей.',
        type: 'info'
      });
      setShowNotification(true);
    } catch (e) {
      console.error('Ошибка диагностики:', e);
      setNotification({
        title: 'Ошибка диагностики',
        message: `Ошибка диагностики: ${(e as Error).message}`,
        type: 'error'
      });
      setShowNotification(true);
    } finally {
      setDiagLoading(false);
    }
  };

  const handleRefreshSchema = async () => {
    setRefreshLoading(true);
    try {
      const result = await refreshSupabaseSchema();
      if (result.success) {
        setNotification({
          title: 'Успешно!',
          message: 'Схема базы данных успешно обновлена! Попробуйте сохранить настройки еще раз.',
          type: 'success'
        });
        setShowNotification(true);
      } else {
        setNotification({
          title: 'Ошибка обновления',
          message: `Не удалось обновить схему: ${result.error}`,
          type: 'error'
        });
        setShowNotification(true);
      }
    } catch (e) {
      console.error('Ошибка обновления схемы:', e);
      setNotification({
        title: 'Ошибка обновления',
        message: `Ошибка обновления схемы: ${(e as Error).message}`,
        type: 'error'
      });
      setShowNotification(true);
    } finally {
      setRefreshLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#bfc1c7', textAlign: 'center', marginTop: 40 }}>Загрузка...</div>;
  }

  return (
    <div>
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
        
        <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
          <button 
            type="button" 
            onClick={handleDiagnose}
            disabled={diagLoading}
            style={{ 
              background: '#ffa502', 
              color: '#fff', 
              border: 'none', 
              padding: '10px 16px', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: '0.9em',
              flex: 1
            }}
          >
            {diagLoading ? 'Проверяю...' : 'Диагностика БД'}
          </button>
          
          <button 
            type="button" 
            onClick={handleRefreshSchema}
            disabled={refreshLoading}
            style={{ 
              background: '#3742fa', 
              color: '#fff', 
              border: 'none', 
              padding: '10px 16px', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: '0.9em',
              flex: 1
            }}
          >
            {refreshLoading ? 'Обновляю...' : 'Обновить схему'}
          </button>
        </div>
        
        <button 
          type="button" 
          onClick={onLogout}
          style={{ 
            background: '#ff4757', 
            color: '#fff', 
            border: 'none', 
            padding: '12px 20px', 
            borderRadius: 8, 
            cursor: 'pointer',
            marginTop: 20,
            width: '100%'
          }}
        >
          Выйти из аккаунта
        </button>
      </form>

      {/* Модальное окно уведомлений */}
      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

export default Settings;
