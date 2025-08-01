



import { useState, useEffect } from 'react';
import './App.css';
import AddShift from './pages/AddShift';
import Shifts from './pages/Shifts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AuthForm from './components/AuthForm';
import { IconPlus, IconHistory, IconAnalytics, IconSettings, IconBack } from './components/icons';
import { signUp, signIn, signOut, getCurrentUser, type User } from './api/supabaseApi';

type Page = 'home' | 'add' | 'shifts' | 'analytics' | 'settings';

const pageMeta: Record<Exclude<Page, 'home'>, { title: string }> = {
  add: { title: 'Добавить смену' },
  shifts: { title: 'История' },
  analytics: { title: 'Аналитика' },
  settings: { title: 'Настройки' },
};

function App() {
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Проверяем, авторизован ли пользователь при загрузке
    const checkUser = async () => {
      try {
        console.log('Проверяем текущего пользователя...');
        const currentUser = await getCurrentUser();
        console.log('Текущий пользователь:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('Ошибка проверки пользователя:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleLogin = async (loginOrEmail: string, password: string, rememberMe: boolean) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      console.log('Попытка входа с:', { loginOrEmail, rememberMe });
      const user = await signIn(loginOrEmail, password, rememberMe);
      console.log('Успешный вход:', user);
      setUser(user);
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      setAuthError(error.message || 'Ошибка входа');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string, username: string) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      console.log('Попытка регистрации с:', { email, name, username });
      const user = await signUp(email, password, name, username);
      console.log('Успешная регистрация:', user);
      setUser(user);
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      setAuthError(error.message || 'Ошибка регистрации');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setPage('home');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#181c2f',
        color: '#bfc1c7' 
      }}>
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={authLoading}
        error={authError}
      />
    );
  }

  let content = null;
  let title = '';
  if (page === 'add') { content = <AddShift />; title = pageMeta.add.title; }
  if (page === 'shifts') { content = <Shifts />; title = pageMeta.shifts.title; }
  if (page === 'analytics') { content = <Analytics />; title = pageMeta.analytics.title; }
  if (page === 'settings') { content = <Settings onLogout={handleLogout} />; title = pageMeta.settings.title; }

  if (page === 'home') {
    return (
      <div className="tg-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#181c2f' }}>
        <h1 style={{ color: '#6c4aff', marginBottom: 32 }}>DRIVER STAT</h1>
        <div style={{ color: '#bfc1c7', marginBottom: 24, fontSize: '1.1em' }}>
          Добро пожаловать, {user.name}!
        </div>
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
