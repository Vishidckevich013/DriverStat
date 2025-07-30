



import React, { useState } from 'react';
import './App.css';
import AddShift from './pages/AddShift';
import Shifts from './pages/Shifts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { IconPlus, IconHistory, IconAnalytics, IconSettings, IconBack } from './components/icons';

type Page = 'home' | 'add' | 'shifts' | 'analytics' | 'settings';

const pageMeta: Record<Exclude<Page, 'home'>, { title: string }> = {
  add: { title: 'Добавить смену' },
  shifts: { title: 'История' },
  analytics: { title: 'Аналитика' },
  settings: { title: 'Настройки' },
};


function getTelegramUserId() {
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
}

function App() {
  const [page, setPage] = useState<Page>('home');
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Проверяем авторизацию при загрузке
  React.useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      // Для отладки: выводим initDataUnsafe и user в консоль
      console.log('Telegram.WebApp.initDataUnsafe:', tg.initDataUnsafe);
      console.log('Telegram.WebApp.initDataUnsafe.user:', tg.initDataUnsafe?.user);
    } else {
      console.log('Telegram.WebApp не найден');
    }
    const id = getTelegramUserId();
    setUserId(id);
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return <div style={{ color: '#bfc1c7', textAlign: 'center', marginTop: 40 }}>Загрузка...</div>;
  }

  if (!userId) {
    // Для отладки: выводим initDataUnsafe и user.id на экран
    const tg = (window as any).Telegram?.WebApp;
    const debugInitData = tg?.initDataUnsafe ? JSON.stringify(tg.initDataUnsafe, null, 2) : 'нет данных';
    const debugUserId = tg?.initDataUnsafe?.user?.id || 'нет';
    return (
      <div className="tg-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#181c2f' }}>
        <h1 style={{ color: '#6c4aff', marginBottom: 32 }}>DRIVER STAT</h1>
        <div style={{ color: '#fff', marginBottom: 24, fontSize: '1.1em' }}>Для работы приложения требуется авторизация через Telegram.</div>
        <button className="tg-btn" style={{ fontSize: '1.1em', padding: '12px 28px', background: '#6c4aff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }} onClick={() => window.location.reload()}>
          Войти через Telegram
        </button>
        <div style={{ color: '#bfc1c7', marginTop: 18, fontSize: '0.95em', maxWidth: 320, textAlign: 'center' }}>
          Откройте приложение через Telegram-бота, чтобы авторизация прошла автоматически.
        </div>
        <div style={{ color: '#ffb347', marginTop: 28, fontSize: '0.95em', maxWidth: 400, textAlign: 'left', background: '#23263a', padding: 12, borderRadius: 8 }}>
          <b>Отладка Telegram WebApp:</b><br />
          <b>user.id:</b> {debugUserId}<br />
          <b>initDataUnsafe:</b>
          <pre style={{ color: '#fff', fontSize: 12, background: 'none', margin: 0 }}>{debugInitData}</pre>
        </div>
      </div>
    );
  }

  let content = null;
  let title = '';
  if (page === 'add') { content = <AddShift />; title = pageMeta.add.title; }
  if (page === 'shifts') { content = <Shifts />; title = pageMeta.shifts.title; }
  if (page === 'analytics') { content = <Analytics />; title = pageMeta.analytics.title; }
  if (page === 'settings') { content = <Settings />; title = pageMeta.settings.title; }

  if (page === 'home') {
    return (
      <div className="tg-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#181c2f' }}>
        <h1 style={{ color: '#6c4aff', marginBottom: 32 }}>DRIVER STAT</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 260 }}>
          <button className="tg-btn" onClick={() => setPage('add')}><span style={{verticalAlign:'middle',marginRight:10,display:'inline-block'}}><IconPlus /></span> Добавить смену</button>
          <button className="tg-btn" onClick={() => setPage('shifts')}><span style={{verticalAlign:'middle',marginRight:10,display:'inline-block'}}><IconHistory /></span> История</button>
          <button className="tg-btn" onClick={() => setPage('analytics')}><span style={{verticalAlign:'middle',marginRight:10,display:'inline-block'}}><IconAnalytics /></span> Аналитика</button>
          <button className="tg-btn" onClick={() => setPage('settings')}><span style={{verticalAlign:'middle',marginRight:10,display:'inline-block'}}><IconSettings /></span> Настройки</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tg-app" style={{ minHeight: '100vh', background: '#181c2f', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 400, margin: '0 auto', padding: '24px 0 12px 0' }}>
        <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: '#6c4aff', fontSize: 22, cursor: 'pointer', marginRight: 12, display:'flex', alignItems:'center' }}>
          <IconBack />
        </button>
        <h2 style={{ margin: 0, color: '#fff', fontWeight: 600 }}>{title}</h2>
      </div>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', flex: 1 }}>
        {content}
      </div>
    </div>
  );
}

export default App;
