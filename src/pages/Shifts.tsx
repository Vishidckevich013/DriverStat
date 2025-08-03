

import { useEffect, useState } from 'react';
import { getShifts, clearShifts, getSettings, getCurrentUser, deleteShift, updateShift } from '../api/supabaseApi';
import ConfirmModal from '../components/ConfirmModal';
import NotificationModal from '../components/NotificationModal';

const Shifts = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ orderPrice: 100, fuelPrice: 60, fuelRate: 10 });
  const [loading, setLoading] = useState(true);
  const [clearLoading, setClearLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [editingShift, setEditingShift] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  
  // Состояния для модальных окон
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ title: '', message: '', type: 'info' as any });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Shifts: Получаем текущего пользователя...');
        const user = await getCurrentUser();
        if (!user) {
          console.error('Shifts: Пользователь не авторизован');
          return;
        }
        console.log('Shifts: Пользователь найден:', user.id);
        setUserId(user.id);

        console.log('Shifts: Загружаем смены и настройки...');
        const [shiftsData, settingsData] = await Promise.all([
          getShifts(user.id),
          getSettings(user.id),
        ]);
        
        console.log('Shifts: Полученные смены:', shiftsData);
        console.log('Shifts: Полученные настройки:', settingsData);
        
        setShifts(shiftsData || []);
        
        // Используем настройки по умолчанию если их нет в базе
        const defaultSettings = { orderPrice: 100, fuelPrice: 60, fuelRate: 10, minSalaryEnabled: false, minSalaryDay: 65, minSalaryEvening: 35 };
        setSettings(settingsData || defaultSettings);
        
        console.log('Shifts: Итоговые настройки для расчетов:', settingsData || defaultSettings);
      } catch (e) {
        console.error('Shifts: Ошибка загрузки данных:', e);
        alert('Ошибка загрузки данных!');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClear = async () => {
    if (!userId) {
      setNotification({
        title: 'Ошибка авторизации',
        message: 'Пользователь не авторизован',
        type: 'error'
      });
      setShowNotification(true);
      return;
    }
    
    // Показываем модальное окно подтверждения
    setShowClearConfirm(true);
  };

  const confirmClearShifts = async () => {
    setClearLoading(true);
    try {
      await clearShifts(userId);
      setShifts([]);
      setNotification({
        title: 'Успешно!',
        message: 'История смен успешно очищена',
        type: 'success'
      });
      setShowNotification(true);
    } catch (e) {
      console.error('Ошибка при очистке истории:', e);
      setNotification({
        title: 'Ошибка',
        message: 'Ошибка при очистке истории!',
        type: 'error'
      });
      setShowNotification(true);
    } finally {
      setClearLoading(false);
    }
  };

  const handleDeleteShift = async (shift: any) => {
    if (!userId) {
      setNotification({
        title: 'Ошибка авторизации',
        message: 'Пользователь не авторизован',
        type: 'error'
      });
      setShowNotification(true);
      return;
    }
    
    setShiftToDelete(shift);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteShift = async () => {
    if (!shiftToDelete) return;
    
    setDeleteLoading(shiftToDelete.id);
    try {
      await deleteShift(userId, shiftToDelete.id);
      setShifts(shifts.filter(s => s.id !== shiftToDelete.id));
      setNotification({
        title: 'Успешно!',
        message: 'Смена удалена',
        type: 'success'
      });
      setShowNotification(true);
    } catch (e) {
      console.error('Ошибка при удалении смены:', e);
      setNotification({
        title: 'Ошибка',
        message: 'Ошибка при удалении смены!',
        type: 'error'
      });
      setShowNotification(true);
    } finally {
      setDeleteLoading(null);
      setShiftToDelete(null);
    }
  };

  const handleEditShift = (shift: any) => {
    setEditingShift({ ...shift });
  };

  const handleSaveEdit = async () => {
    if (!userId || !editingShift) return;
    
    try {
      await updateShift(userId, editingShift.id, {
        date: editingShift.date,
        orders: editingShift.orders,
        distance: editingShift.distance,
        type: editingShift.type
      });
      
      setShifts(shifts.map(s => s.id === editingShift.id ? editingShift : s));
      setEditingShift(null);
      alert('Смена успешно обновлена');
    } catch (e) {
      console.error('Ошибка при обновлении смены:', e);
      alert('Ошибка при обновлении смены!');
    }
  };

  const handleCancelEdit = () => {
    setEditingShift(null);
  };

  const calcFuel = (shift: any) => {
    const fuelPrice = Number(settings.fuelPrice) || 0;
    const fuelRate = Number(settings.fuelRate) || 0;
    return (shift.distance * fuelRate / 100) * fuelPrice;
  };

  const calcSalary = (shift: any) => {
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

  const calcTotalEarnings = (shift: any) => {
    // Общий заработок = зарплата + топливо
    return calcSalary(shift) + calcFuel(shift);
  };

  // Функция для форматирования даты в российском формате
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2); // Последние 2 цифры года
    
    return `${day} ${month} ${year}г`;
  };

  if (loading) {
    return <div style={{ color: '#bfc1c7', textAlign: 'center', marginTop: 40 }}>Загрузка...</div>;
  }
  return (
    <div>
      <h2>Все смены</h2>
      <button 
        onClick={handleClear} 
        disabled={clearLoading} 
        className="clear-btn"
        style={{ marginBottom: 16, padding: '8px 16px' }}
      >
        {clearLoading ? 'Очищаю...' : 'Очистить историю'}
      </button>
      {shifts.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p style={{ color: '#bfc1c7', fontSize: '1.1em' }}>Нет данных о сменах.<br/>Чтобы появилась информация, добавьте хотя бы одну смену.</p>
          <button 
            onClick={() => window.location.hash = 'add'}
            style={{ 
              background: '#6c4aff', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 7, 
              padding: '10px 22px', 
              fontSize: '1em', 
              cursor: 'pointer',
              marginTop: 16
            }}
          >
            Добавить смену
          </button>
        </div>
      ) : (
        <div className="new-table-wrapper">
          <div className="new-table-header">
            История смен ({shifts.length})
          </div>
          <div className="new-table-scroll">
            <table className="new-shifts-table">
            <thead>
              <tr>
                <th>Дата</th>
                {settings.minSalaryEnabled && <th>Тип</th>}
                <th>Заказы</th>
                <th>Пробег</th>
                <th>Зарплата</th>
                <th>Топливо</th>
                <th>Доход</th>
                <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              editingShift && editingShift.id === shift.id ? (
                // Режим редактирования
                <tr key={shift.id} style={{ textAlign: 'center', background: '#2a2f5a' }}>
                  <td>
                    <input 
                      type="date" 
                      value={editingShift.date}
                      onChange={e => setEditingShift({...editingShift, date: e.target.value})}
                      style={{ padding: '4px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', color: '#000', fontSize: '0.9em' }}
                    />
                  </td>
                  {settings.minSalaryEnabled && (
                    <td>
                      <select 
                        value={editingShift.type || 'day'}
                        onChange={e => setEditingShift({...editingShift, type: e.target.value})}
                        style={{ padding: '4px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', color: '#000', fontSize: '0.9em' }}
                      >
                        <option value="day">Дневная</option>
                        <option value="evening">Вечерняя</option>
                      </select>
                    </td>
                  )}
                  <td>
                    <input 
                      type="number" 
                      value={editingShift.orders}
                      onChange={e => setEditingShift({...editingShift, orders: Number(e.target.value)})}
                      style={{ padding: '4px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', color: '#000', fontSize: '0.9em', width: '60px' }}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editingShift.distance}
                      onChange={e => setEditingShift({...editingShift, distance: Number(e.target.value)})}
                      style={{ padding: '4px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', color: '#000', fontSize: '0.9em', width: '70px' }}
                    />
                  </td>
                  <td>{calcSalary(editingShift).toFixed(2)}</td>
                  <td>{calcFuel(editingShift).toFixed(2)}</td>
                  <td>{calcTotalEarnings(editingShift).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button 
                        onClick={handleSaveEdit}
                        className="save-btn"
                        style={{ padding: '4px 8px', fontSize: '0.8em' }}
                      >
                        ✓
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="cancel-btn"
                        style={{ padding: '4px 8px', fontSize: '0.8em' }}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // Обычный режим просмотра
                <tr key={shift.id} style={{ textAlign: 'center' }}>
                  <td>{formatDate(shift.date)}</td>
                  {settings.minSalaryEnabled && <td>{shift.type === 'evening' ? 'Вечерняя' : 'Дневная'}</td>}
                  <td>{shift.orders}</td>
                  <td>{shift.distance}</td>
                  <td>{calcSalary(shift).toFixed(2)}</td>
                  <td>{calcFuel(shift).toFixed(2)}</td>
                  <td>{calcTotalEarnings(shift).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleEditShift(shift)}
                        disabled={editingShift !== null}
                        style={{ 
                          padding: '4px 8px', 
                          background: editingShift ? '#666' : '#3498db', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 4, 
                          cursor: editingShift ? 'not-allowed' : 'pointer', 
                          fontSize: '0.8em' 
                        }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteShift(shift)}
                        disabled={deleteLoading === shift.id || editingShift !== null}
                        style={{ 
                          padding: '4px 8px', 
                          background: (deleteLoading === shift.id || editingShift) ? '#666' : '#e74c3c', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 4, 
                          cursor: (deleteLoading === shift.id || editingShift) ? 'not-allowed' : 'pointer', 
                          fontSize: '0.8em' 
                        }}
                      >
                        {deleteLoading === shift.id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения очистки истории */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClearShifts}
        title="Удаление всей истории"
        message={`⚠️ ВНИМАНИЕ!\n\nВы действительно хотите удалить ВСЮ историю смен?\n\n• Будут удалены все ${shifts.length} смен(ы)\n• Восстановить данные будет НЕВОЗМОЖНО\n• Это действие нельзя отменить\n\nВы уверены, что хотите продолжить?`}
        confirmText="Да, удалить всё"
        cancelText="Отмена"
        type="warning"
        isDangerous={true}
      />

      {/* Модальное окно подтверждения удаления смены */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setShiftToDelete(null);
        }}
        onConfirm={confirmDeleteShift}
        title="Удаление смены"
        message={shiftToDelete ? `Удалить смену от ${formatDate(shiftToDelete.date)}?` : ''}
        confirmText="Удалить"
        cancelText="Отмена"
        type="warning"
        isDangerous={true}
      />

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

export default Shifts;
