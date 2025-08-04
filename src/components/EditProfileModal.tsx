import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';
import { supabase } from '../supabaseClient';
import { generateDefaultAvatar } from '../utils/avatarUtils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar?: string;
  };
  onUserUpdate: (updatedUser: { name: string; avatar?: string }) => void;
  onNotification: (message: string, type: 'success' | 'error') => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user,
  onUserUpdate,
  onNotification 
}) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    avatar: user.avatar || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Обновляем форму при изменении пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || ''
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [user]);

  // Закрытие по ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          avatar: 'Пожалуйста, выберите изображение'
        }));
        return;
      }

      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          avatar: 'Размер файла не должен превышать 5MB'
        }));
        return;
      }

      setSelectedFile(file);
      
      // Создаем URL для предпросмотра
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Очищаем ошибки
      setErrors(prev => ({
        ...prev,
        avatar: ''
      }));
    }
  };

  const uploadAvatarFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Проверка имени
    if (!formData.name.trim()) {
      newErrors.name = 'Имя не может быть пустым';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let avatarUrl = formData.avatar;

      // Если выбран новый файл, загружаем его
      if (selectedFile) {
        try {
          avatarUrl = await uploadAvatarFile(selectedFile);
        } catch (uploadError) {
          console.error('Ошибка загрузки аватара:', uploadError);
          onNotification('Ошибка загрузки изображения', 'error');
          setIsLoading(false);
          return;
        }
      }

      // Обновляем данные в таблице users (только имя)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: formData.name.trim()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Ошибка обновления профиля:', updateError);
        throw new Error('Ошибка при обновлении профиля');
      }

      // Также обновляем данные в auth.users (user_metadata) включая аватар
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          name: formData.name.trim(),
          avatar: avatarUrl || null
        }
      });

      if (authUpdateError) {
        console.warn('Предупреждение: не удалось обновить metadata:', authUpdateError);
        // Не блокируем выполнение, это не критично
      }

      onNotification('Профиль успешно обновлен!', 'success');

      // Уведомляем родительский компонент об обновлении
      onUserUpdate({
        name: formData.name.trim(),
        avatar: avatarUrl || undefined
      });

      onClose();

    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      onNotification(
        error instanceof Error ? error.message : 'Произошла ошибка при обновлении профиля',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDefaultAvatar = () => {
    const defaultAvatar = generateDefaultAvatar(formData.name || user.name || 'User');
    setFormData(prev => ({
      ...prev,
      avatar: defaultAvatar
    }));
    setSelectedFile(null);
    setPreviewUrl(null);
    
    // Очищаем ошибки
    setErrors(prev => ({
      ...prev,
      avatar: ''
    }));
  };

  const handleCancel = () => {
    // Сбрасываем форму к исходным данным
    setFormData({
      name: user.name || '',
      avatar: user.avatar || ''
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop high-priority" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Редактирование профиля</h3>
          <button 
            className="modal-close"
            onClick={handleCancel}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-message">Аватар:</p>
          
          {/* Превью текущего аватара */}
          <div className="avatar-preview-section">
            <div className="current-avatar">
              {previewUrl || formData.avatar ? (
                <img 
                  src={previewUrl || formData.avatar} 
                  alt="Аватар" 
                  className="avatar-preview-image"
                />
              ) : (
                <div className="avatar-preview-placeholder">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            
            <div className="avatar-upload-section">
              <input
                type="file"
                id="avatar-file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="avatar-file-input"
              />
              <label htmlFor="avatar-file" className="avatar-file-label">
                {selectedFile ? selectedFile.name : 'Выберите изображение'}
              </label>
              <button
                type="button"
                className="generate-default-avatar-btn"
                onClick={handleGenerateDefaultAvatar}
                disabled={isLoading}
              >
                Сгенерировать аватарку
              </button>
              {selectedFile && (
                <button
                  type="button"
                  className="clear-file-btn"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    const input = document.getElementById('avatar-file') as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                  disabled={isLoading}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {errors.avatar && <span className="edit-profile-error">{errors.avatar}</span>}

          <p className="modal-message">Имя:</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`edit-profile-input ${errors.name ? 'error' : ''}`}
            placeholder="Введите ваше имя"
          />
          {errors.name && <span className="edit-profile-error">{errors.name}</span>}

          <p className="modal-message">Email (только просмотр):</p>
          <input
            type="email"
            value={user.email}
            disabled={true}
            className="edit-profile-input disabled"
            placeholder="Email недоступен для изменения"
          />

          <p className="modal-message">Логин (только просмотр):</p>
          <input
            type="text"
            value={user.username}
            disabled={true}
            className="edit-profile-input disabled"
            placeholder="Логин недоступен для изменения"
          />

          <div className="modal-actions">
            <button
              type="button"
              className="modal-button modal-button-cancel"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="button"
              className="modal-button modal-button-submit"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
