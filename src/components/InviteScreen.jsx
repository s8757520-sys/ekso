/**
 * File: InviteScreen.jsx
 * Date: 2026-09-07
 * Purpose: Invite page — add contact by link
 * Description: Shows user profile and "Add contact" button
 * Author: Ekso Team
 * Updated: sends add_contact to server with delay before closing
 */

import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const InviteScreen = ({ lang = 'ru', nickname: currentUser, onAddContact, onClose }) => {
  const [nickname, setNickname] = useState('');
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const { isConnected, sendMessage, lastMessage } = useWebSocket();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nick = params.get('nickname') || params.get('invite');
    if (nick) {
      setNickname(nick);
    } else {
      setStatus('error');
      setError('Никнейм не указан');
    }
  }, []);

  useEffect(() => {
    if (isConnected && nickname) {
      sendMessage('check_nickname', { nickname });
    }
  }, [isConnected, nickname]);

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'check_nickname_result') {
      if (lastMessage.payload.available) {
        setStatus('not_found');
        setError('Пользователь не найден');
      } else {
        setStatus('found');
        sendMessage('get_profile', { nickname });
      }
    }

    if (lastMessage.type === 'get_profile_result') {
      const data = lastMessage.payload;
      if (data.profile) {
        setProfile(data);
        setStatus('ready');
      } else {
        setStatus('error');
        setError('Ошибка загрузки профиля');
      }
    }
  }, [lastMessage]);

  const handleAddContact = () => {
    if (!profile) return;

    const newContact = {
      id: profile.nickname,
      name: profile.nickname,
      displayName: profile.profile?.displayName || profile.nickname,
      avatar: profile.profile?.avatar || null,
      lastMessage: '',
      time: '',
    };

    const saved = localStorage.getItem('contacts');
    let contacts = saved ? JSON.parse(saved) : [];
    if (!contacts.some(c => c.id === newContact.id)) {
      contacts.push(newContact);
      localStorage.setItem('contacts', JSON.stringify(contacts));
    }

    if (isConnected && currentUser) {
      sendMessage('add_contact', {
        user: currentUser,
        contact: profile.nickname
      });
      console.log(`📤 add_contact: ${currentUser} → ${profile.nickname}`);
    }

    setTimeout(() => {
      onAddContact(profile);
    }, 700);
  };

  const t = {
    ru: {
      title: 'Приглашение в Ekso',
      add: 'Добавить в контакты',
      loading: 'Загрузка...',
      notFound: 'Пользователь не найден',
      error: 'Ошибка',
      back: 'Назад',
    },
    en: {
      title: 'Invite to Ekso',
      add: 'Add to contacts',
      loading: 'Loading...',
      notFound: 'User not found',
      error: 'Error',
      back: 'Back',
    }
  };

  const text = t[lang] || t.ru;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-[var(--text-secondary)]">{text.loading}</p>
        </div>
      </div>
    );
  }

  if (status === 'not_found' || status === 'error') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-6 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{text.notFound}</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-4">{error || 'Проверьте правильность ссылки'}</p>
          <button onClick={onClose} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">{text.back}</button>
        </div>
      </div>
    );
  }

  if (status === 'ready' && profile) {
    const displayName = profile.profile?.displayName || profile.nickname;
    const avatarUrl = profile.profile?.avatar 
      ? (profile.profile.avatar.startsWith('http') ? profile.profile.avatar : `https://ekso.me${profile.profile.avatar}`)
      : null;

    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto bg-blue-500 flex items-center justify-center text-white text-4xl font-bold mb-4">
              {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{displayName}</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">@{profile.nickname}</p>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {lang === 'ru' ? 'Приглашает вас в контакты Ekso' : 'Invites you to contacts on Ekso'}
            </p>
            <button onClick={handleAddContact} className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition text-sm font-medium">
              {text.add}
            </button>
            <button onClick={onClose} className="w-full mt-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
              {text.back}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InviteScreen;
