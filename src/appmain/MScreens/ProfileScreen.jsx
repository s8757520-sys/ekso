/**
 * File: ProfileScreen.jsx
 * Date: 2026-09-06
 * Purpose: User profile screen
 * Description: Shows nickname, public key, avatar, status, copy button
 * Author: Ekso Team
 */

import { useState } from 'react';

const ProfileScreen = ({ nickname, publicKey, lang = 'ru' }) => {
  const [copied, setCopied] = useState(false);

  const texts = {
    ru: {
      title: 'Мой профиль',
      nickname: 'Никнейм',
      publicKey: 'Публичный ключ',
      copy: 'Копировать',
      copied: 'Скопировано!',
      statusOnline: 'онлайн',
      editProfile: 'Редактировать профиль',
    },
    en: {
      title: 'My Profile',
      nickname: 'Nickname',
      publicKey: 'Public Key',
      copy: 'Copy',
      copied: 'Copied!',
      statusOnline: 'online',
      editProfile: 'Edit Profile',
    }
  };

  const t = texts[lang] || texts.ru;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKey || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayKey = publicKey
    ? `${publicKey.slice(0, 12)}...${publicKey.slice(-6)}`
    : '—';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4">
      <div className="max-w-md mx-auto bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-6">
        {/* Заголовок */}
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
          {t.title}
        </h2>

        {/* Аватар + Никнейм + Статус */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mb-3">
            {nickname ? nickname.charAt(0).toUpperCase() : '?'}
          </div>
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {nickname || 'Гость'}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            <span className="text-sm text-green-500">{t.statusOnline}</span>
          </div>
        </div>

        {/* Публичный ключ */}
        <div className="bg-[var(--bg-primary)] rounded-xl p-4 mb-4">
          <p className="text-xs text-[var(--text-secondary)] mb-1">{t.publicKey}</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-mono text-[var(--text-primary)] break-all">
              {displayKey}
            </p>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 px-3 py-1 text-sm bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition"
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>
        </div>

        {/* Кнопка редактирования */}
        <button
          className="w-full py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)] transition font-medium"
        >
          {t.editProfile}
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;