/**
 * File: ProfileScreen.jsx
 * Date: 2026-09-06
 * Purpose: User profile screen
 * Description: Shows avatar, nickname, editable name, stats (icons), security, and actions
 * Author: Ekso Team
 */

import { useState, useEffect } from 'react';

const ProfileScreen = ({ nickname, publicKey, lang = 'ru', onBack }) => {
  const [copied, setCopied] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Загружаем имя из localStorage при монтировании
  useEffect(() => {
    const savedName = localStorage.getItem('ekso_display_name');
    if (savedName) {
      setDisplayName(savedName);
    } else if (nickname) {
      setDisplayName(nickname);
    }
  }, [nickname]);

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
      placeholder: 'Введите ваше имя',
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
      placeholder: 'Enter your name',
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
    localStorage.setItem('ekso_display_name', displayName);
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

        {/* Аватар + Статус */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl md:text-4xl font-bold mb-3">
            {nickname ? nickname.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            <span className="text-sm text-green-500">{t.statusOnline}</span>
          </div>
        </div>

        {/* Имя (редактируемое) */}
        <div className="w-full mb-4">
          <p className="text-sm text-[var(--text-secondary)] mb-1">{t.name}</p>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.placeholder}
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
              >
                {t.save}
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false);
                  setDisplayName(localStorage.getItem('ekso_display_name') || nickname || '');
                }}
                className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition text-sm"
              >
                {t.cancel}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] rounded-lg">
              <span className="text-[var(--text-primary)]">{displayName || '—'}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-sm text-blue-500 hover:text-blue-600 transition"
              >
                ✏️ {t.edit}
              </button>
            </div>
          )}
        </div>

        {/* Никнейм (неизменяемый) */}
        <div className="w-full mb-6">
          <p className="text-sm text-[var(--text-secondary)] mb-1">{t.nickname}</p>
          <div className="px-4 py-3 bg-[var(--bg-primary)] rounded-lg">
            <span className="text-[var(--text-primary)]">@{nickname || 'Гость'}</span>
          </div>
        </div>

        {/* Статистика — иконки + текст */}
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

        {/* Футер */}
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
