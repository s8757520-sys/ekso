/**
 * Файл: RestoreScreen.jsx
 * Дата: 2026-09-06
 * Назначение: Экран входа на новом устройстве
 * Описание: Пользователь выбирает тип восстановления:
 *          1. Только мастер-ключ (без чатов)
 *          2. Мастер-ключ + PIN (с чатами)
 * Автор: Ekso Team
 */

import { useState, useRef, useEffect } from 'react';

const RestoreScreen = ({ onRestore, lang = 'ru' }) => {
  const [mode, setMode] = useState(() => {
    return sessionStorage.getItem('restore_mode') || null;
  });
  const [masterKeyBlocks, setMasterKeyBlocks] = useState(() => {
    const saved = sessionStorage.getItem('restore_masterKey');
    return saved ? JSON.parse(saved) : Array(8).fill('');
  });
  const [pin, setPin] = useState(() => {
    const saved = sessionStorage.getItem('restore_pin');
    return saved ? JSON.parse(saved) : ['', '', '', ''];
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pinInputRefs = useRef([]);
  const masterInputRefs = useRef([]);

  // Сохраняем состояние при изменении
  useEffect(() => {
    sessionStorage.setItem('restore_mode', mode);
  }, [mode]);

  useEffect(() => {
    sessionStorage.setItem('restore_masterKey', JSON.stringify(masterKeyBlocks));
  }, [masterKeyBlocks]);

  useEffect(() => {
    sessionStorage.setItem('restore_pin', JSON.stringify(pin));
  }, [pin]);

  const texts = {
    ru: {
      title: 'Вход на новом устройстве',
      choose: 'Как вы хотите восстановить доступ?',
      optionMaster: 'К кошельку и аккаунту без архива',
      descMaster: 'Только мастер-ключ',
      optionFull: 'С полным архивом аккаунта',
      descFull: 'Мастер-ключ + PIN',
      masterLabel: 'Мастер-ключ (48 цифр)',
      pinLabel: 'PIN-код (4 цифры)',
      restore: 'Восстановить',
      loading: 'Проверка...',
      error: 'Неверные данные. Попробуйте снова.',
    },
    en: {
      title: 'Login on new device',
      choose: 'How do you want to restore access?',
      optionMaster: 'To wallet and account without archive',
      descMaster: 'Master key only',
      optionFull: 'With full account archive',
      descFull: 'Master key + PIN',
      masterLabel: 'Master key (48 digits)',
      pinLabel: 'PIN code (4 digits)',
      restore: 'Restore',
      loading: 'Checking...',
      error: 'Invalid data. Please try again.',
    }
  };

  const t = texts[lang] || texts.ru;

  const handleMasterChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newBlocks = [...masterKeyBlocks];
    const cleaned = value.slice(0, 6);
    newBlocks[index] = cleaned;
    setMasterKeyBlocks(newBlocks);
    setError('');

    if (cleaned.length === 6 && index < 7) {
      masterInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(0, 1);
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handleMasterKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !masterKeyBlocks[index] && index > 0) {
      masterInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullKey = masterKeyBlocks.join('');
    if (fullKey.length !== 48) {
      setError('Введите все 8 блоков мастер-ключа');
      return;
    }

    if (mode === 'full') {
      const pinString = pin.join('');
      if (pinString.length !== 4) {
        setError('Введите 4 цифры PIN-кода');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Очищаем sessionStorage после успешного восстановления
      sessionStorage.removeItem('restore_mode');
      sessionStorage.removeItem('restore_masterKey');
      sessionStorage.removeItem('restore_pin');
      onRestore({
        mode,
        masterKey: masterKeyBlocks,
        pin: mode === 'full' ? pin.join('') : null,
      });
    } catch (err) {
      setError(t.error);
      setIsLoading(false);
    }
  };

  if (!mode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">{t.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{t.choose}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setMode('master')}
            className="w-full text-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-all"
          >
            <div className="font-medium text-gray-800">{t.optionMaster}</div>
            <div className="text-sm text-gray-400">{t.descMaster}</div>
          </button>

          <button
            onClick={() => setMode('full')}
            className="w-full text-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-all"
          >
            <div className="font-medium text-gray-800">{t.optionFull}</div>
            <div className="text-sm text-gray-400">{t.descFull}</div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {mode === 'master' ? t.optionMaster : t.optionFull}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'master' ? 'Введите мастер-ключ' : 'Введите мастер-ключ и PIN-код'}
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-2 text-center">{t.masterLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {masterKeyBlocks.map((block, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-xs text-gray-600 font-sans flex items-center justify-center font-medium flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-300 font-light">|</span>
              <input
                ref={(el) => (masterInputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={block}
                onChange={(e) => handleMasterChange(index, e.target.value)}
                onKeyDown={(e) => handleMasterKeyDown(index, e)}
                placeholder="000000"
                className="flex-1 min-w-0 px-2 py-2 text-center font-mono text-lg font-bold text-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={6}
                autoFocus={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {mode === 'full' && (
        <>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">{t.pinLabel}</p>
          </div>
          <div className="flex justify-center gap-3 max-w-xs mx-auto">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (pinInputRefs.current[index] = el)}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            ))}
          </div>
        </>
      )}

      {error && <div className="text-center text-red-500 text-sm">{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition ${
          isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? t.loading : t.restore}
      </button>

      <button
        onClick={() => {
          setMode(null);
          sessionStorage.removeItem('restore_mode');
        }}
        className="w-full text-sm text-gray-500 hover:underline text-center"
      >
        ← {lang === 'ru' ? 'Назад' : 'Back'}
      </button>
    </div>
  );
};

export default RestoreScreen;