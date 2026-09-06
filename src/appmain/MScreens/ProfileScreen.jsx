/**
 * File: ProfileScreen.jsx
 * Date: 2026-09-06
 * Purpose: User profile screen
 * Description: Shows avatar, nickname, editable name, stats (icons), security, and actions
 * Author: Ekso Team
 */

import { useState } from 'react';

const ProfileScreen = ({ nickname, publicKey, lang = 'ru', onBack }) => {
  const [copied, setCopied] = useState(false);
  const [displayName, setDisplayName] = useState(nickname || '');
  const [isEditingName, setIsEditingName] = useState(false);

  const texts = {
    ru: {
      title: 'Мой профиль',
      nickname: 'Никнейм',
      name: 'Имя',
      edit: 'Редактировать',
      save: 'Сохранить',
      cancel: 'Отмена',
      statusOnline: 'онлайн',
      contacts: 'Контакты',
      channels: 'Каналы',
      notifications: 'Уведомления',
      changePin: 'Сменить PIN',
      share: 'Поделиться профилем',
      qr: 'QR-код',
      copy: 'Копировать',
      copied: 'Скопировано!',
    },
    en: {
      title: 'My Profile',
      nickname: 'Nickname',
      name: 'Name',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      statusOnline: 'online',
      contacts: 'Contacts',
      channels: 'Channels',
      notifications: 'Notifications',
      changePin: 'Change PIN',
      share: 'Share profile',
      qr: 'QR Code',
      copy: 'Copy',
      copied: 'Copied!',
    }
  };

  const t = texts[lang] || texts.ru;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://ekso.me/@${nickname}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = `https://ekso.me/@${nickname}`;
    navigator.clipboard.writeText(url);
    alert(lang === 'ru' ? 'Ссылка скопирована!' : 'Link copied!');
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    // TODO: сохранять имя в IndexedDB
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-6 md:p-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack} 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-sm md:text-base"
          >
            ← {lang === 'ru' ? 'Назад' : 'Back'}
          </button>
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)]">{t.title}</h2>
          <div className="w-16"></div>
        </div>

        {/* Аватар + Никнейм + Имя + Статус */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl md:text-4xl font-bold mb-3">
            {nickname ? nickname.charAt(0).toUpperCase() : '?'}
          </div>
          
          <p className="text-lg md:text-xl font-semibold text-[var(--text-primary)]">
            @{nickname || 'Гость'}
          </p>
          
          <div className="flex items-center gap-2 mt-1">
            {isEditingName ? (
              <>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="px-3 py-1 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="text-sm text-blue-500 hover:text-blue-600 transition"
                >
                  {t.save}
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setDisplayName(nickname || '');
                  }}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  {t.cancel}
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-[var(--text-secondary)]">{displayName || nickname || 'Гость'}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs text-blue-500 hover:text-blue-600 transition"
                >
                  ✏️ {t.edit}
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            <span className="text-sm text-green-500">{t.statusOnline}</span>
          </div>
        </div>

        {/* Статистика — иконки + текст (данные подтянутся позже) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[var(--bg-primary)] rounded-xl p-3 text-center hover:bg-[var(--bg-hover)] transition cursor-pointer">
            <div className="text-2xl mb-1">👥</div>
            <p className="text-xs text-[var(--text-secondary)]">{t.contacts}</p>
          </div>
          <div className="bg-[var(--bg-primary)] rounded-xl p-3 text-center hover:bg-[var(--bg-hover)] transition cursor-pointer">
            <div className="text-2xl mb-1">📢</div>
            <p className="text-xs text-[var(--text-secondary)]">{t.channels}</p>
          </div>
          <div className="bg-[var(--bg-primary)] rounded-xl p-3 text-center hover:bg-[var(--bg-hover)] transition cursor-pointer">
            <div className="text-2xl mb-1">🔔</div>
            <p className="text-xs text-[var(--text-secondary)]">{t.notifications}</p>
          </div>
        </div>

        {/* Безопасность и действия */}
        <div className="space-y-2">
          <button
            onClick={() => alert('Смена PIN')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition text-sm"
          >
            <span className="text-[var(--text-primary)]">🔐 {t.changePin}</span>
            <span className="text-[var(--text-secondary)]">→</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition text-sm"
          >
            <span className="text-[var(--text-primary)]">🔗 {t.share}</span>
            <span className="text-[var(--text-secondary)]">→</span>
          </button>

          <button
            onClick={() => alert('QR-код')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition text-sm"
          >
            <span className="text-[var(--text-primary)]">📱 {t.qr}</span>
            <span className="text-[var(--text-secondary)]">→</span>
          </button>
        </div>

        {/* Футер с копирайтом */}
        <div className="mt-6 text-center">
          <button
            onClick={handleCopy}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            {copied ? t.copied : `${t.copy} @${nickname}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
