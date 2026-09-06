/**
 * File: PinScreen.jsx
 * Date: 2026-09-05
 * Purpose: PIN code entry screen (4 digits)
 * Description: User enters 4 digits, confirms, proceeds to master key
 * Author: Ekso Team
 */

import { useState, useRef } from 'react';
import LanguageToggle from './LanguageToggle';

const PinScreen = ({ onNext, lang = 'ru', onToggleLang }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const texts = {
    ru: {
      title: 'Установите PIN-код',
      subtitle: 'Введите 4 цифры для защиты мастер-ключа',
      confirm: 'Подтвердить',
      hint: 'PIN-код хранится только на вашем устройстве',
      error: 'Введите 4 цифры',
    },
    en: {
      title: 'Set a PIN code',
      subtitle: 'Enter 4 digits to protect your master key',
      confirm: 'Confirm',
      hint: 'PIN code is stored only on your device',
      error: 'Enter 4 digits',
    }
  };

  const t = texts[lang] || texts.ru;

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
    onNext(pinString);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-7xl font-bold text-center text-gray-800 font-['Dubtronic'] font-light">
        Ekso
      </h1>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {t.title}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t.subtitle}
        </p>
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

      {error && (
        <div className="text-center text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        {t.confirm}
      </button>

      <p className="text-xs text-center text-gray-400">
        {t.hint}
      </p>

      <div className="flex justify-center mt-4">
        <LanguageToggle lang={lang} onToggle={onToggleLang} />
      </div>
    </div>
  );
};

export default PinScreen;