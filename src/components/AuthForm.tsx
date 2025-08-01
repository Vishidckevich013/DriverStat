import React, { useState } from 'react';
import './AuthForm.css';
import { IconUser, IconLock, IconMail } from './icons';

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name: string) => Promise<void>;
  loading: boolean;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, loading, error }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await onLogin(email, password);
    } else {
      await onRegister(email, password, name);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="auth-title">DRIVER STAT</h1>
        <h2 className="auth-subtitle">{isLogin ? 'Вход' : 'Регистрация'}</h2>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-fields">
          {!isLogin && (
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
          )}
          
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
