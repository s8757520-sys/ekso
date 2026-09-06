/**
 * File: LoginScreen.jsx
 * Date: 2026-09-06
 * Purpose: PIN entry screen for login
 * Description: User enters 4-digit PIN and it is verified against IndexedDB
 * Author: Ekso Team
 */

import { useState, useRef, useEffect } from 'react';
import { getPinFromDB } from '../utils/indexedDB';

const LoginScreen = ({ onLogin, lang = 'ru' }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [storedPin, setStoredPin] = useState(null);
  const inputRefs = useRef([]);

  const texts = {
    ru: {
      title: 'Введите PIN-код',
      subtitle: 'Введите 4 цифры для входа',
      confirm: 'Войти',
      error: 'Неверный PIN-код. Попробуйте снова.',
    },
    en: {
      title: 'Enter PIN code',
      subtitle: 'Enter 4 digits to login',
      confirm: 'Login',
      error: 'Incorrect PIN. Please try again.',
    },
  };

  const t = texts[lang] || texts.ru;

  // Загружаем сохранённый PIN из IndexedDB
  useEffect(() => {
    const loadPin = async () => {
      try {
        const savedPin = await getPinFromDB();
        setStoredPin(savedPin);
      } catch (err) {
        console.warn('Failed to load PIN:', err);
      }
    };
    loadPin();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(0, 1);
    setPin(newPin);
    setError('');
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = () => {
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      setError(t.error);
      return;
    }

    // Проверка PIN
    if (storedPin && pinString === storedPin) {
      onLogin(pinString);
    } else {
      setError(t.error);
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
  <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t.title}</h2>
  <p className="text-sm text-[var(--text-secondary)] mt-1">{t.subtitle}</p>
</div>

      <div className="flex justify-center gap-3 max-w-xs mx-auto">
        {pin.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="password"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            autoFocus={index === 0}
          />
        ))}
      </div>

      {error && <div className="text-center text-red-500 text-sm">{error}</div>}

      <button
        onClick={handleSubmit}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        {t.confirm}
      </button>
    </div>
  );
};

export default LoginScreen;
