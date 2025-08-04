import React, { useEffect, useRef } from 'react';
import './ProfileModal.css';
import { EditIcon, SettingsIcon, LogoutIcon } from './ProfileIcons';
import { signOut } from '../api/supabaseApi';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  anchorElement?: HTMLElement | null;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar?: string;
  };
  onEditProfile?: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  anchorElement,
  user,
  onEditProfile
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне модального окна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current && 
        !modalRef.current.contains(event.target as Node) &&
        anchorElement &&
        !anchorElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorElement]);

  // Позиционирование модального окна относительно аватара
  useEffect(() => {
    if (isOpen && modalRef.current && anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      const modal = modalRef.current;
      
      // Позиционируем окно под аватаром справа
      modal.style.top = `${rect.bottom + 8}px`;
      modal.style.right = `${window.innerWidth - rect.right}px`;
    }
  }, [isOpen, anchorElement]);

  const handleLogout = async () => {
    try {
      console.log('Выход из аккаунта');
      
      // Выход через Supabase
      await signOut();
      
      // Очистка localStorage
      localStorage.clear();
      
      // Перенаправление на главную страницу (где сработает проверка авторизации)
      window.location.href = '/';
      
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
    onClose();
  };

  const handleEditProfile = () => {
    console.log('Открытие модального окна редактирования профиля');
    onClose(); // Закрываем текущее модальное окно
    if (onEditProfile) {
      onEditProfile(); // Вызываем callback для открытия модального окна редактирования
    }
  };

  const handleSettings = () => {
    // Переход на страницу настроек через hash
    console.log('Переход на страницу настроек');
    window.location.hash = 'settings';
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-backdrop">
      <div className="profile-modal" ref={modalRef}>
        {/* Стрелка указывающая на аватар */}
        <div className="profile-modal-arrow"></div>
        
        {/* Информация о пользователе */}
        <div className="profile-modal-header">
          <div className="profile-modal-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" />
            ) : (
              <div className="profile-modal-avatar-placeholder">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="profile-modal-info">
            <h3 className="profile-modal-name">{user?.name || 'Пользователь'}</h3>
            <p className="profile-modal-email">{user?.email || 'email@example.com'}</p>
            <p className="profile-modal-username">@{user?.username || 'username'}</p>
          </div>
        </div>

        {/* Разделитель */}
        <div className="profile-modal-divider"></div>

        {/* Меню действий */}
        <div className="profile-modal-menu">
          <button className="profile-modal-menu-item" onClick={handleEditProfile}>
            <span className="profile-modal-menu-icon">
              <EditIcon size={18} />
            </span>
            <span>Редактировать профиль</span>
          </button>
          
          <button className="profile-modal-menu-item" onClick={handleSettings}>
            <span className="profile-modal-menu-icon">
              <SettingsIcon size={18} />
            </span>
            <span>Настройки</span>
          </button>
          
          <div className="profile-modal-divider profile-modal-divider-menu"></div>
          
          <button 
            className="profile-modal-menu-item profile-modal-logout" 
            onClick={handleLogout}
          >
            <span className="profile-modal-menu-icon">
              <LogoutIcon size={18} />
            </span>
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
