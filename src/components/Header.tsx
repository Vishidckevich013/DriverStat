import { useState, useRef, useEffect } from 'react';
import './Header.css';
import DriveStatLogo from './DriveStatLogo';
import FeedbackModal from './FeedbackModal';
import ProfileModal from './ProfileModal';
import EditProfileModal from './EditProfileModal';
import NotificationModal from './NotificationModal';
import { sendFeedbackToTelegram, getCurrentUser } from '../api/supabaseApi';
import { getUserAvatar } from '../utils/avatarUtils';

const Header = () => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ title: '', message: '', type: 'success' as any });
  const profileAreaRef = useRef<HTMLDivElement>(null);

  // Загружаем информацию о пользователе при загрузке компонента
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
      }
    };
    loadUser();
  }, []);

  const handleFeedbackSubmit = async (type: string, message: string) => {
    try {
      // Отправляем в Telegram
      const telegramSent = await sendFeedbackToTelegram(type, message, {
        name: currentUser?.name || 'Гость',
        email: currentUser?.email
      });
      
      if (telegramSent) {
        setNotification({
          title: 'Спасибо за обратную связь!',
          message: 'Ваше сообщение отправлено и будет рассмотрено.',
          type: 'success'
        });
        setShowNotification(true);
      } else {
        // Fallback если Telegram не настроен
        console.log('Отправка обратной связи:', { type, message, user: currentUser?.name });
        setNotification({
          title: `${type === 'complaint' ? 'Жалоба' : 'Предложение'} принято`,
          message: `Ваше сообщение: "${message}"`,
          type: 'success'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Ошибка отправки обратной связи:', error);
      setNotification({
        title: 'Ошибка отправки',
        message: 'Произошла ошибка при отправке. Попробуйте позже.',
        type: 'error'
      });
      setShowNotification(true);
    }
  };

  const handleProfileAreaClick = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  const handleUserUpdate = (updatedUser: { name: string; avatar?: string }) => {
    // Обновляем данные пользователя в локальном состоянии
    setCurrentUser((prev: any) => prev ? { ...prev, ...updatedUser } : null);
    console.log('Пользователь обновлен:', updatedUser);
  };

  const handleProfileNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      title: type === 'success' ? 'Успешно!' : 'Ошибка!',
      message,
      type
    });
    setShowNotification(true);
  };

  const handleOpenEditProfile = () => {
    setIsEditProfileModalOpen(true);
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
          <div 
            className="profile-area"
            ref={profileAreaRef}
            onClick={handleProfileAreaClick}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="user">{currentUser?.name || 'Пользователь'}</span>
            {currentUser?.avatar ? (
              <img 
                className="avatar" 
                src={getUserAvatar(currentUser, 32)} 
                alt="User Avatar"
              />
            ) : (
              <div 
                className="avatar avatar-placeholder"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#6c4aff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        anchorElement={profileAreaRef.current}
        user={currentUser}
        onEditProfile={handleOpenEditProfile}
      />

      {/* Модальное окно уведомлений */}
      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      {/* Модальное окно редактирования профиля */}
      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          user={{
            id: currentUser.id || '',
            name: currentUser.name,
            email: currentUser.email,
            username: currentUser.username
          }}
          onUserUpdate={handleUserUpdate}
          onNotification={handleProfileNotification}
        />
      )}
    </>
  );
};

export default Header;
