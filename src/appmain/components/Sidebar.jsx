/**
 * File: Sidebar.jsx
 * Date: 2026-09-07
 * Purpose: Sidebar navigation menu component
 * Author: Ekso Team
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ConfirmModal from '../../components/ConfirmModal';

const getFullAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('/avatars/')) return `https://ekso.me${avatar}`;
  return avatar;
};

const Sidebar = ({ isOpen, onClose, onNavigate, nickname, publicKey, lang = 'ru', onLanguageChange, activeScreen }) => {
  const { theme, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayName, setDisplayName] = useState(nickname || 'Гость');
  const [avatar, setAvatar] = useState(null);

  const updateProfileData = () => {
    const savedName = localStorage.getItem('ekso_display_name');
    if (savedName) {
      setDisplayName(savedName);
    } else {
      setDisplayName(nickname || 'Гость');
    }

    const savedAvatar = localStorage.getItem('ekso_avatar');
    if (savedAvatar) {
      setAvatar(getFullAvatarUrl(savedAvatar));
    } else {
      setAvatar(null);
    }
  };

  useEffect(() => {
    updateProfileData();
  }, [nickname, isOpen]);

  useEffect(() => {
    const handleProfileUpdate = () => updateProfileData();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const texts = {
    ru: {
      profile: 'Мой профиль',
      chats: 'Чаты',
      channels: 'Мои каналы',
      contacts: 'Мои контакты',
      notifications: 'Уведомления',
      wallet: 'Кошелёк',
      network: 'Сеть хранителей',
      settings: 'Настройки',
      invite: 'Пригласить друга',
      help: 'Помощь и FAQ',
      logout: 'Выйти',
      close: 'Закрыть',
      logoutTitle: 'Выйти из аккаунта?',
      logoutDesc: 'Вы уверены, что хотите выйти?',
      cancel: 'Отмена',
      confirmLogout: 'Выйти',
    },
    en: {
      profile: 'My Profile',
      chats: 'Chats',
      channels: 'My Channels',
      contacts: 'My Contacts',
      notifications: 'Notifications',
      wallet: 'Wallet',
      network: 'Keepers Network',
      settings: 'Settings',
      invite: 'Invite a friend',
      help: 'Help & FAQ',
      logout: 'Logout',
      close: 'Close',
      logoutTitle: 'Logout?',
      logoutDesc: 'Are you sure you want to logout?',
      cancel: 'Cancel',
      confirmLogout: 'Logout',
    },
  };

  const t = texts[lang] || texts.ru;

  const menuItems = [
    { id: 'profile', label: t.profile, icon: '👤' },
    { id: 'chats', label: t.chats, icon: '💬' },
    { id: 'channels', label: t.channels, icon: '📢' },
    { id: 'contacts', label: t.contacts, icon: '📇' },
    { id: 'notifications', label: t.notifications, icon: '🔔' },
    { id: 'wallet', label: t.wallet, icon: '💰' },
    { id: 'network', label: t.network, icon: '🌐' },
    { id: 'settings', label: t.settings, icon: '⚙️' },
    { id: 'help', label: t.help, icon: '❓' },
  ];

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onNavigate('logout');
  };

  const toggleLanguage = () => {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    localStorage.setItem('lang', newLang);
    if (onLanguageChange) onLanguageChange(newLang);
  };

  const displayNameToShow = displayName || nickname || 'Гость';
  const firstLetter = displayNameToShow.charAt(0).toUpperCase();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div className={`fixed top-0 left-0 h-full w-72 bg-[var(--bg-secondary)] z-50 shadow-xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b border-[var(--border-color)] relative flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {avatar ? (
                  <img src={avatar} alt={displayNameToShow} className="w-full h-full object-cover" />
                ) : (
                  <span>{firstLetter}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--bg-secondary)] rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[var(--text-primary)] text-sm truncate">
                {displayNameToShow}
              </div>
              <div className="text-xs text-green-500">{lang === 'ru' ? 'онлайн' : 'online'}</div>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose(); }}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 transition text-sm ${
                activeScreen === item.id
                  ? 'bg-[var(--bg-active)] text-[var(--text-primary)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <span className="text-lg w-8 flex-shrink-0 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-[var(--border-color)] flex-shrink-0">
          <div className="flex items-center justify-around">
            <button
              onClick={toggleTheme}
              className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition flex items-center justify-center text-2xl"
              title={theme === 'light' ? 'Переключить на тёмную тему' : 'Switch to light theme'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <button
              onClick={toggleLanguage}
              className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition flex items-center justify-center text-2xl"
              title={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
            >
              {lang === 'ru' ? '🇬🇧' : '🇷🇺'}
            </button>

            <button
              onClick={handleLogoutClick}
              className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition flex items-center justify-center text-2xl"
              title={lang === 'ru' ? 'Выйти' : 'Logout'}
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title={t.logoutTitle}
        message={t.logoutDesc}
        confirmText={t.confirmLogout}
        cancelText={t.cancel}
        lang={lang}
      />
    </>
  );
};

export default Sidebar;
