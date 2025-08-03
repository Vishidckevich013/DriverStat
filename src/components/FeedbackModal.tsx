import React, { useState } from 'react';
import './FeedbackModal.css';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, message: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [feedbackType, setFeedbackType] = useState<string>('Предложение');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(feedbackType, message.trim());
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Ошибка отправки обратной связи:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-modal-backdrop" onClick={handleBackdropClick}>
      <div className="feedback-modal">
        {/* Заголовок */}
        <div className="feedback-modal-header">
          <h2>Обратная связь</h2>
          <button className="feedback-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Секция выбора типа */}
          <div className="feedback-type-section">
            <label className="feedback-type-label">Тип обращения:</label>
            <div className="feedback-type-options">
              {['Проблема', 'Предложение', 'Вопрос'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`feedback-type-option ${feedbackType === type ? 'selected' : ''}`}
                  onClick={() => setFeedbackType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Секция сообщения */}
          <div className="feedback-message-section">
            <label className="feedback-message-label">Тип обращения:</label>
            <textarea
              className="feedback-message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Опишите ваше предложение"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Кнопки */}
          <div className="feedback-actions">
            <button
              type="button"
              className="feedback-btn feedback-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="feedback-btn feedback-btn-submit"
              disabled={isSubmitting || !message.trim()}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
