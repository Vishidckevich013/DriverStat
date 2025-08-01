import React from 'react';
import Modal from './Modal';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type={type}>
      <div>
        <p style={{ 
          margin: '0 0 20px 0', 
          color: '#374151', 
          lineHeight: '1.5',
          fontSize: '16px' 
        }}>
          {message}
        </p>
        
        <div className="modal-actions">
          <button 
            className="modal-button modal-button-primary" 
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;
