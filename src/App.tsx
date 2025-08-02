



import { useState, useEffect } from 'react';
import './App.css';
import AddShift from './pages/AddShift';
import Shifts from './pages/Shifts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
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

  // Обработка hash-навигации
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // убираем #
      if (hash && ['add', 'shifts', 'analytics', 'settings'].includes(hash)) {
        setPage(hash as Page);
      }
    };

    // Проверяем hash при загрузке
    handleHashChange();
    
    // Слушаем изменения hash
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
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
      <div style={{ display: 'flex', minHeight: '100vh', background: '#181c2f' }}>
        {/* Sidebar - скрыт на мобильных, виден на планшетах и десктопах */}
        <div className="sidebar-desktop">
          <Sidebar onNavigate={(newPage) => { setPage(newPage); window.location.hash = newPage; }} current={page} />
        </div>
        
        {/* Основной контент */}
        <div className="main-content" style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          paddingBottom: '100px', // Место для мобильного сайдбара
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#6c4aff', marginBottom: 32, textAlign: 'center' }}>DRIVER STAT</h1>
          <div style={{ color: '#bfc1c7', marginBottom: 24, fontSize: '1.1em', textAlign: 'center' }}>
            Добро пожаловать, {user.name}!
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 18, 
            width: '100%',
            maxWidth: '300px'
          }}>
            <button className="tg-btn" onClick={() => { setPage('add'); window.location.hash = 'add'; }}>
              <span style={{verticalAlign:'middle',marginRight:10,display:'inline-block'}}><IconPlus /></span> 
              Добавить смену
            </button>
            <button className="tg-btn" onClick={() => { setPage('shifts'); window.location.hash = 'shifts'; }}>
              <span style={{verticalAlign:'middle',marginRight:10,display:'inline-block'}}><IconHistory /></span> 
              История
            </button>
            <button className="tg-btn" onClick={() => { setPage('analytics'); window.location.hash = 'analytics'; }}>
              <span style={{verticalAlign:'middle',marginRight:10,display:'inline-block'}}><IconAnalytics /></span> 
              Аналитика
            </button>
            <button className="tg-btn" onClick={() => { setPage('settings'); window.location.hash = 'settings'; }}>
              <span style={{verticalAlign:'middle',marginRight:10,display:'inline-block'}}><IconSettings /></span> 
              Настройки
            </button>
          </div>
        </div>
        
        {/* Мобильный сайдбар внизу */}
        <Sidebar onNavigate={(newPage) => { setPage(newPage); window.location.hash = newPage; }} current={page} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#181c2f' }}>
      {/* Sidebar - скрыт на мобильных, виден на планшетах и десктопах */}
      <div className="sidebar-desktop">
        <Sidebar onNavigate={(newPage) => { setPage(newPage); window.location.hash = newPage; }} current={page} />
      </div>
      
      {/* Основной контент */}
      <div className="main-content" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        paddingBottom: '100px', // Место для мобильного сайдбара
        minHeight: '100vh'
      }}>
        {/* Заголовок с кнопкой назад */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%', 
          padding: '20px',
          borderBottom: '1px solid #2d2f36'
        }}>
          <button 
            onClick={() => { setPage('home'); window.location.hash = ''; }} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#6c4aff', 
              fontSize: 22, 
              cursor: 'pointer', 
              marginRight: 12, 
              display:'flex', 
              alignItems:'center',
              padding: '8px'
            }}
          >
            <IconBack />
          </button>
          <h2 style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: 'clamp(1.2em, 4vw, 1.5em)' }}>
            {title}
          </h2>
        </div>
        
        {/* Контент страницы */}
        <div style={{ 
          flex: 1, 
          padding: '20px',
          overflow: 'auto'
        }}>
          {content}
        </div>
      </div>
      
      {/* Мобильный сайдбар внизу */}
      <Sidebar onNavigate={(newPage) => { setPage(newPage); window.location.hash = newPage; }} current={page} />
    </div>
  );
}

export default App;
