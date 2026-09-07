/**
 * File: ProfileScreen.jsx
 * Date: 2026-09-07
 * Purpose: User profile screen
 * Description: Shows avatar, nickname, editable full name (sync with server) + avatar upload
 * Author: Ekso Team
 * Updated: 
 *   - Исправлены кнопки редактора имени (адаптация под мобильные)
 *   - Сокращён текст "Уведомления" -> "Уведомл." на мобильных
 *   - Добавлено событие profileUpdated для мгновенного обновления Sidebar
 */

import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

const getFullAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('/avatars/')) return `https://ekso.me${avatar}`;
  return avatar;
};

const ProfileScreen = ({ nickname, publicKey, lang = 'ru', onBack }) => {
  const [copied, setCopied] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { isConnected, sendMessage, lastMessage } = useWebSocket();

  useEffect(() => {
    if (isConnected && nickname) {
      sendMessage('get_profile', { nickname });
    }
  }, [isConnected, nickname]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'get_profile_result') {
      const data = lastMessage.payload;
      if (data.profile) {
        if (data.profile.displayName) {
          setDisplayName(data.profile.displayName);
          localStorage.setItem('ekso_display_name', data.profile.displayName);
        }
        if (data.profile.avatar) {
          const fullUrl = getFullAvatarUrl(data.profile.avatar);
          setAvatar(fullUrl);
          localStorage.setItem('ekso_avatar', fullUrl);
        }
      } else {
        const saved = localStorage.getItem('ekso_display_name');
        if (saved) setDisplayName(saved);
        else if (nickname) setDisplayName(nickname);
        
        const savedAvatar = localStorage.getItem('ekso_avatar');
        if (savedAvatar) setAvatar(getFullAvatarUrl(savedAvatar));
      }
      setProfileLoaded(true);
    }
  }, [lastMessage, nickname]);

  useEffect(() => {
    if (!profileLoaded) {
      const saved = localStorage.getItem('ekso_display_name');
      if (saved) setDisplayName(saved);
      else if (nickname) setDisplayName(nickname);
      
      const savedAvatar = localStorage.getItem('ekso_avatar');
      if (savedAvatar) setAvatar(getFullAvatarUrl(savedAvatar));
    }
  }, [nickname, profileLoaded]);

  const texts = {
    ru: {
      title: 'Мой профиль',
      nickname: 'Никнейм',
      name: 'Имя',
      save: 'Сохранить',
      cancel: 'Отмена',
      statusOnline: 'онлайн',
      statusOffline: 'офлайн',
      contacts: 'Контакты',
      channels: 'Каналы',
      notifications: 'Уведомления',
      notificationsShort: 'Уведомл.',
      changePin: 'Сменить PIN',
      share: 'Поделиться профилем',
      qr: 'QR-код',
      copy: 'Копировать',
      copied: 'Скопировано!',
      placeholder: 'Введите ваше имя',
      saving: 'Сохранение...',
      uploadAvatar: 'Загрузить аватар',
    },
    en: {
      title: 'My Profile',
      nickname: 'Nickname',
      name: 'Full Name',
      save: 'Save',
      cancel: 'Cancel',
      statusOnline: 'online',
      statusOffline: 'offline',
      contacts: 'Contacts',
      channels: 'Channels',
      notifications: 'Notifications',
      notificationsShort: 'Notif.',
      changePin: 'Change PIN',
      share: 'Share profile',
      qr: 'QR Code',
      copy: 'Copy',
      copied: 'Copied!',
      placeholder: 'Enter your full name',
      saving: 'Saving...',
      uploadAvatar: 'Upload avatar',
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
    if (!displayName.trim()) {
      alert(lang === 'ru' ? 'Имя не может быть пустым' : 'Name cannot be empty');
      return;
    }
    setIsEditingName(false);
    localStorage.setItem('ekso_display_name', displayName);

    if (isConnected && nickname) {
      sendMessage('update_profile', {
        nickname: nickname,
        displayName: displayName,
      });
    }

    // ========== УВЕДОМЛЯЕМ Sidebar ОБ ОБНОВЛЕНИИ ==========
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'ru' ? 'Файл слишком большой (макс 5 МБ)' : 'File too large (max 5 MB)');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setAvatar(base64);
      localStorage.setItem('ekso_avatar', base64);

      if (isConnected && nickname) {
        sendMessage('update_profile', {
          nickname: nickname,
          avatar: base64,
        });
      }
      setIsUploading(false);

      // ========== УВЕДОМЛЯЕМ Sidebar ОБ ОБНОВЛЕНИИ ==========
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    };
    reader.onerror = () => {
      alert(lang === 'ru' ? 'Ошибка чтения файла' : 'Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-6 md:p-8">
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

        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl md:text-4xl font-bold mb-3 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                displayName ? displayName.charAt(0).toUpperCase() : (nickname ? nickname.charAt(0).toUpperCase() : '?')
              )}
            </div>
            <label className="absolute bottom-2 right-0 bg-blue-500 hover:bg-blue-600 rounded-full p-1.5 cursor-pointer shadow-lg transition">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </label>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="text-white text-sm">⏳</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full inline-block ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-gray-400'}`}>
              {isConnected ? t.statusOnline : t.statusOffline}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            @{nickname || 'Гость'}
          </p>
        </div>

        <div className="w-full mb-6">
          <p className="text-sm text-[var(--text-secondary)] mb-1">{t.name}</p>
          {isEditingName ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder={t.placeholder}
                autoFocus
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSaveName}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                >
                  {t.save}
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    const saved = localStorage.getItem('ekso_display_name');
                    setDisplayName(saved || nickname || '');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition text-sm"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] rounded-lg">
              <span className="text-[var(--text-primary)]">{displayName || '—'}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-blue-500 hover:text-blue-600 transition text-lg"
              >
                ✏️
              </button>
            </div>
          )}
          {!isConnected && (
            <p className="text-xs text-yellow-500 mt-1">
              ⚠️ {lang === 'ru' ? 'Нет подключения к серверу. Данные сохранятся локально.' : 'No server connection. Data will be saved locally.'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => alert(lang === 'ru' ? 'Контакты' : 'Contacts')}
            className="bg-[var(--bg-primary)] rounded-xl p-3 text-center hover:bg-[var(--bg-hover)] transition cursor-pointer"
          >
            <div className="text-2xl mb-1">👥</div>
            <p className="text-xs text-[var(--text-secondary)]">{t.contacts}</p>
          </button>
          <button
            onClick={() => alert(lang === 'ru' ? 'Каналы' : 'Channels')}
            className="bg-[var(--bg-primary)] rounded-xl p-3 text-center hover:bg-[var(--bg-hover)] transition cursor-pointer"
          >
            <div className="text-2xl mb-1">📢</div>
            <p className="text-xs text-[var(--text-secondary)]">{t.channels}</p>
          </button>
          <button
            onClick={() => alert(lang === 'ru' ? 'Уведомления' : 'Notifications')}
            className="bg-[var(--bg-primary)] rounded-xl p-3 text-center hover:bg-[var(--bg-hover)] transition cursor-pointer"
          >
            <div className="text-2xl mb-1">🔔</div>
            <p className="text-xs text-[var(--text-secondary)] break-words">
              <span className="hidden sm:inline">{t.notifications}</span>
              <span className="sm:hidden">{t.notificationsShort}</span>
            </p>
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => alert(lang === 'ru' ? 'Смена PIN' : 'Change PIN')}
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
            onClick={() => alert(lang === 'ru' ? 'QR-код' : 'QR Code')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition text-sm"
          >
            <span className="text-[var(--text-primary)]">📱 {t.qr}</span>
            <span className="text-[var(--text-secondary)]">→</span>
          </button>
        </div>

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
