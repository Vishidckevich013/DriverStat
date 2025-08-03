import { useState } from 'react';
import './Header.css';
import DriveStatLogo from './DriveStatLogo';
import FeedbackModal from './FeedbackModal';

const Header = () => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const handleFeedbackSubmit = async (type: string, message: string) => {
    // Здесь можно добавить отправку на сервер
    console.log('Отправка обратной связи:', { type, message });
    
    // Временно просто показываем alert
    alert(`${type} отправлено:\n${message}`);
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
