/**
 * File: NicknameScreen.jsx
 * Date: 2026-09-07
 * Purpose: Choose a nickname during onboarding
 * Description: Sends nickname to server, waits for confirmation, only saves locally on success
 * Author: Ekso Team
 */

import { useState, useEffect } from 'react';

const NicknameScreen = ({ 
  lang = 'ru', 
  publicKey, 
  onSuccess, 
  wsSendMessage, 
  wsLastMessage,
  wsIsConnected 
}) => {
  const [nickname, setNickname] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState('');
  const [attemptedNickname, setAttemptedNickname] = useState('');

  const texts = {
    ru: {
      title: 'Выберите никнейм',
      subtitle: 'Ваш уникальный идентификатор в сети Ekso',
      placeholder: 'Введите никнейм (латиница)',
      check: 'Проверить',
      available: '✅ Никнейм доступен!',
      taken: '❌ Никнейм занят, попробуйте другой',
      error: 'Ошибка проверки',
      register: 'Зарегистрировать',
      registering: 'Регистрация...',
      success: 'Аккаунт создан!',
      failed: 'Ошибка регистрации, попробуйте позже',
      back: 'Назад',
      invalid: 'Только латиница, цифры и _',
    },
    en: {
      title: 'Choose a nickname',
      subtitle: 'Your unique identifier in the Ekso network',
      placeholder: 'Enter nickname (latin letters)',
      check: 'Check',
      available: '✅ Nickname available!',
      taken: '❌ Nickname taken, try another',
      error: 'Check error',
      register: 'Register',
      registering: 'Registering...',
      success: 'Account created!',
      failed: 'Registration failed, try again later',
      back: 'Back',
      invalid: 'Only latin letters, digits and _',
    }
  };

  const t = texts[lang] || texts.ru;

  // Обработка ответа на проверку никнейма
  useEffect(() => {
    if (wsLastMessage && wsLastMessage.type === 'check_nickname_result') {
      setIsChecking(false);
      const data = wsLastMessage.payload;
      if (data.available) {
        setError('');
        // Автоматически регистрируем после проверки
        handleRegister(attemptedNickname);
      } else {
        setError(t.taken);
        setIsRegistered(false);
      }
    }
  }, [wsLastMessage]);

  // Обработка ответа на регистрацию
  useEffect(() => {
    if (wsLastMessage && wsLastMessage.type === 'register_nickname_result') {
      const data = wsLastMessage.payload;
      if (data.success) {
        // ✅ Регистрация успешна — сохраняем и переходим дальше
        localStorage.setItem('nickname', attemptedNickname);
        localStorage.setItem('publicKey', publicKey);
        setIsRegistered(true);
        setIsChecking(false);
        // Переходим к следующему шагу
        setTimeout(() => onSuccess(attemptedNickname), 500);
      } else {
        // ❌ Регистрация не удалась — показываем ошибку
        setError(data.error || t.failed);
        setIsChecking(false);
      }
    }
  }, [wsLastMessage]);

  const handleCheck = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError(t.invalid);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError(t.invalid);
      return;
    }

    // Проверяем, что WebSocket подключён
    if (!wsIsConnected) {
      setError(t.failed);
      return;
    }

    setError('');
    setIsChecking(true);
    setAttemptedNickname(trimmed);
    
    // Отправляем запрос на проверку
    wsSendMessage('check_nickname', { nickname: trimmed });
  };

  const handleRegister = (nickToRegister) => {
    if (!wsIsConnected) {
      setError(t.failed);
      setIsChecking(false);
      return;
    }

    // Отправляем запрос на регистрацию
    wsSendMessage('register_nickname', { 
      nickname: nickToRegister, 
      publicKey 
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-2">
          {t.title}
        </h1>
        <p className="text-[var(--text-secondary)] text-center text-sm mb-6">
          {t.subtitle}
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.toLowerCase())}
            placeholder={t.placeholder}
            className="w-full px-4 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isChecking || isRegistered}
            autoFocus
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {!isRegistered && !isChecking && (
            <button
              onClick={handleCheck}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
            >
              {t.check}
            </button>
          )}

          {isChecking && (
            <button
              disabled
              className="w-full py-3 bg-blue-300 text-white font-semibold rounded-lg cursor-not-allowed"
            >
              {t.registering}
            </button>
          )}

          {isRegistered && (
            <div className="text-center text-green-500 py-2">
              {t.success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NicknameScreen;
