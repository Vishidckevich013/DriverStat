



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

function App() {
  const [page, setPage] = useState<Page>('home');

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
