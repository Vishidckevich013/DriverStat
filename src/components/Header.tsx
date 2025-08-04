import { useState } from 'react';
import './Header.css';
import DriveStatLogo from './DriveStatLogo';
import FeedbackModal from './FeedbackModal';
import { sendFeedbackToTelegram, getCurrentUser } from '../api/supabaseApi';

const Header = () => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const handleFeedbackSubmit = async (type: string, message: string) => {
    try {
      // Получаем информацию о текущем пользователе
      const user = await getCurrentUser();
      
      // Отправляем в Telegram
      const telegramSent = await sendFeedbackToTelegram(type, message, {
        name: user?.name || 'Гость',
        email: user?.email
      });
      
      if (telegramSent) {
        alert('Спасибо за обратную связь! Ваше сообщение отправлено.');
      } else {
        // Fallback если Telegram не настроен
        console.log('Отправка обратной связи:', { type, message, user: user?.name });
        alert(`${type === 'complaint' ? 'Жалоба' : 'Предложение'} принято:\n${message}`);
      }
    } catch (error) {
      console.error('Ошибка отправки обратной связи:', error);
      alert('Произошла ошибка при отправке. Попробуйте позже.');
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-brand">
          <DriveStatLogo size={40} className="header-logo" />
          <span className="header-title">DriveStat</span>
        </div>
        <div className="header-actions">
          <button className="notif" title="Уведомления">🔔</button>
          <button 
            className="msg" 
            title="Обратная связь"
            onClick={() => setIsFeedbackModalOpen(true)}
          >
            💬
          </button>
          <span className="user">Ronald R.</span>
          <img className="avatar" src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
        </div>
      </header>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
};

export default Header;
