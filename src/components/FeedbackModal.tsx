import React, { useState } from 'react';
import './FeedbackModal.css';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, message: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [feedbackType, setFeedbackType] = useState<string>('complaint');
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

  const handleTypeSelect = (type: string) => {
    setFeedbackType(type);
  };

  const getPlaceholder = () => {
    return feedbackType === 'complaint' ? 'Опишите вашу жалобу...' : 'Опишите ваше предложение...';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Обратная связь</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p className="modal-message">Тип обращения:</p>
          
          <div className="feedback-type-buttons">
            <button 
              className={`type-button ${feedbackType === 'complaint' ? 'active' : ''}`}
              onClick={() => handleTypeSelect('complaint')}
              type="button"
            >
              Жалоба
            </button>
            <button 
              className={`type-button ${feedbackType === 'suggestion' ? 'active' : ''}`}
              onClick={() => handleTypeSelect('suggestion')}
              type="button"
            >
              Предложение
            </button>
          </div>
          
          <p className="modal-message">Сообщение:</p>
          
          <textarea 
            className="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={getPlaceholder()}
            rows={4}
            disabled={isSubmitting}
          />
          
          <div className="modal-actions">
            <button 
              className="modal-button modal-button-cancel" 
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
            >
              Отмена
            </button>
            <button 
              className="modal-button modal-button-submit" 
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              type="button"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
