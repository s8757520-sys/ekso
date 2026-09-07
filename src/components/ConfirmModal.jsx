/**
 * File: ConfirmModal.jsx
 * Date: 2026-09-07
 * Purpose: Reusable confirmation modal
 * Description: Used for logout, delete contact, and other confirmations
 * Author: Ekso Team
 */

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    confirmColor = 'bg-red-500 hover:bg-red-600',
    lang = 'ru'
  }) => {
    if (!isOpen) return null;
  
    const texts = {
      ru: {
        defaultTitle: 'Подтверждение',
        defaultMessage: 'Вы уверены?',
      },
      en: {
        defaultTitle: 'Confirm',
        defaultMessage: 'Are you sure?',
      }
    };
  
    const t = texts[lang] || texts.ru;
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[var(--bg-primary)] rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            {title || t.defaultTitle}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {message || t.defaultMessage}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2 px-4 rounded-lg text-white transition ${confirmColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmModal;