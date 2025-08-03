import React, { useState } from 'react';
import './AuthForm.css';
import { IconUser, IconLock, IconMail } from './icons';
import DriveStatLogo from './DriveStatLogo';

interface AuthFormProps {
  onLogin: (loginOrEmail: string, password: string, rememberMe: boolean) => Promise<void>;
  onRegister: (email: string, password: string, name: string, username: string) => Promise<void>;
  loading: boolean;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, loading, error }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await onLogin(loginOrEmail, password, rememberMe);
    } else {
      await onRegister(email, password, name, username);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-logo">
          <DriveStatLogo size={80} />
          <h1 className="auth-title">DriveStat</h1>
        </div>
        <h2 className="auth-subtitle">{isLogin ? 'Вход' : 'Регистрация'}</h2>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-fields">
          {!isLogin && (
            <>
              <div className="auth-field">
                <div className="auth-field-icon">
                  <IconUser />
                </div>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="auth-field">
                <div className="auth-field-icon">
                  <IconUser />
                </div>
                <input
                  type="text"
                  placeholder="Логин (только латинские буквы и цифры)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  required
                  disabled={loading}
                  minLength={3}
                  maxLength={20}
                />
              </div>

              <div className="auth-field">
                <div className="auth-field-icon">
                  <IconMail />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}
          
          {isLogin && (
            <div className="auth-field">
              <div className="auth-field-icon">
                <IconUser />
              </div>
              <input
                type="text"
                placeholder="Логин или Email"
                value={loginOrEmail}
                onChange={(e) => setLoginOrEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="auth-field">
            <div className="auth-field-icon">
              <IconLock />
            </div>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {isLogin && (
            <div className="auth-checkbox">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="rememberMe">Запомнить меня</label>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-btn" 
            disabled={loading}
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button 
            type="button"
            className="auth-switch-btn"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
