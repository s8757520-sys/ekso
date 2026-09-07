/**
 * Файл: NicknameScreen.jsx
 * Дата: 2026-09-07
 * Назначение: Экран выбора никнейма для нового аккаунта
 * Описание: Пользователь вводит никнейм, проверяет доступность через WebSocket
 * Автор: Ekso Team
 * Обновлено: добавлено ожидание ответа от сервера перед сохранением
 */

import { useState, useEffect } from 'react';

const NicknameScreen = ({
  nickname,
  setNickname,
  status,
  isLoading,
  isConnected,
  checkNickname,
  lang = 'ru',
  // Новые пропсы для регистрации
  publicKey,
  onSuccess,
  wsSendMessage,
  wsLastMessage,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState('');
  const [attemptedNickname, setAttemptedNickname] = useState('');

  const texts = {
    ru: {
      subtitle: 'Придумайте уникальный никнейм',
      label: 'Никнейм',
      placeholder: 'например, alex',
      hint: 'от 3 до 20 символов, только латиница и цифры',
      button: 'Проверить никнейм',
      loading: 'Проверка...',
      errorShort: 'Минимум 3 символа',
      checking: 'Проверка...',
      available: 'Никнейм доступен!',
      taken: 'Никнейм уже занят',
      serverError: 'Ошибка сервера',
      invalidChars: 'Только латиница и цифры',
      noConnection: 'Нет соединения с сервером. Проверьте интернет.',
      registering: 'Регистрация...',
      success: 'Аккаунт создан!',
      failed: 'Ошибка регистрации, попробуйте позже',
    },
    en: {
      subtitle: 'Choose a unique nickname',
      label: 'Nickname',
      placeholder: 'e.g., alex',
      hint: '3 to 20 characters, only letters and numbers',
      button: 'Check nickname',
      loading: 'Checking...',
      errorShort: 'Minimum 3 characters',
      checking: 'Checking...',
      available: 'Nickname is available!',
      taken: 'Nickname is already taken',
      serverError: 'Server error',
      invalidChars: 'Only Latin letters and numbers',
      noConnection: 'No connection to the server. Check your internet.',
      registering: 'Registering...',
      success: 'Account created!',
      failed: 'Registration failed, try again later',
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
      setError(t.errorShort);
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
      setError(t.invalidChars);
      return;
    }
    if (trimmed.length < 3) {
      setError(t.errorShort);
      return;
    }

    if (!isConnected) {
      setError(t.noConnection);
      return;
    }

    setError('');
    setIsChecking(true);
    setAttemptedNickname(trimmed);
    
    // Отправляем запрос на проверку
    wsSendMessage('check_nickname', { nickname: trimmed });
  };

  const handleRegister = (nickToRegister) => {
    if (!isConnected) {
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

  // Определяем, какой статус показывать
  const getStatusStyle = () => {
    if (status.includes('доступен') || status.includes('available')) {
      return 'bg-green-50 text-green-600';
    }
    if (status.includes('занят') || status.includes('taken')) {
      return 'bg-red-50 text-red-600';
    }
    if (status.includes('Проверка') || status.includes('Checking')) {
      return 'bg-blue-50 text-blue-600';
    }
    return 'bg-blue-50 text-blue-600';
  };

  // Если регистрация успешна — показываем успех
  const displayStatus = isRegistered ? t.success : status;

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-700 font-medium">
        {t.subtitle}
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.label}
        </label>
        <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <span className="bg-gray-100 px-3 py-2 text-gray-500">@</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 px-3 py-2 outline-none"
            maxLength={20}
            disabled={isChecking || isRegistered}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {t.hint}
        </p>
      </div>

      {displayStatus && !error && (
        <div className={`p-3 rounded-lg text-center ${getStatusStyle()}`}>
          {displayStatus}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg text-center bg-red-50 text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleCheck}
        disabled={isChecking || isRegistered || !nickname || !isConnected}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
      >
        {isChecking ? t.registering : (isRegistered ? t.success : t.button)}
      </button>
    </div>
  );
};

export default NicknameScreen;
