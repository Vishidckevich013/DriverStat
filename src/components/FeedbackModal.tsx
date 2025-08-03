import React, { useState } from 'react';
import './FeedbackModal.css';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'suggestion' | 'complaint', message: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'complaint'>('suggestion');
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
        <div className="feedback-modal-header">
          <h2>Обратная связь</h2>
          <button className="feedback-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-type-selector">
            <label className="feedback-type-label">Тип обращения:</label>
            <div className="feedback-type-options">
              <label className="feedback-type-option">
                <input
                  type="radio"
                  name="feedbackType"
                  value="suggestion"
                  checked={feedbackType === 'suggestion'}
                  onChange={(e) => setFeedbackType(e.target.value as 'suggestion')}
                />
                <span>Предложение</span>
              </label>
              <label className="feedback-type-option">
                <input
                  type="radio"
                  name="feedbackType"
                  value="complaint"
                  checked={feedbackType === 'complaint'}
                  onChange={(e) => setFeedbackType(e.target.value as 'complaint')}
                />
                <span>Жалоба</span>
              </label>
            </div>
          </div>

          <div className="feedback-message-group">
            <label htmlFor="feedback-message" className="feedback-message-label">
              Сообщение:
            </label>
            <textarea
              id="feedback-message"
              className="feedback-message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'suggestion' 
                  ? 'Опишите ваше предложение...' 
                  : 'Опишите проблему...'
              }
              rows={5}
              required
              disabled={isSubmitting}
            />
          </div>

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
