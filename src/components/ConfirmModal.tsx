import React from 'react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info';
  isDangerous?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  type = 'warning',
  isDangerous = false
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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
            className="modal-button modal-button-secondary" 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`modal-button ${isDangerous ? 'modal-button-danger' : 'modal-button-primary'}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
