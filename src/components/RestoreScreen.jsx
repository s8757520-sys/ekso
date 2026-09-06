/**
 * File: RestoreScreen.jsx
 * Date: 2026-09-06
 * Purpose: Restore account on a new device
 * Description: User chooses recovery mode:
 *          1. Master key only — restores account and wallet (no chat archive)
 *          2. Master key + SEC password — restores account, wallet, and full archive (chats, settings, contacts)
 *          SEC = Special Encrypted Container (backup)
 * Author: Ekso Team
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
  const [secPassword, setSecPassword] = useState(() => {
    const saved = sessionStorage.getItem('restore_secPassword');
    return saved ? JSON.parse(saved) : Array(6).fill('');
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const secInputRefs = useRef([]);
  const masterInputRefs = useRef([]);

  // Clear sessionStorage on mount to always start from mode selection
  useEffect(() => {
    sessionStorage.removeItem('restore_mode');
    sessionStorage.removeItem('restore_masterKey');
    sessionStorage.removeItem('restore_secPassword');
  }, []);

  // Save state on change
  useEffect(() => {
    sessionStorage.setItem('restore_mode', mode);
  }, [mode]);

  useEffect(() => {
    sessionStorage.setItem('restore_masterKey', JSON.stringify(masterKeyBlocks));
  }, [masterKeyBlocks]);

  useEffect(() => {
    sessionStorage.setItem('restore_secPassword', JSON.stringify(secPassword));
  }, [secPassword]);

  const texts = {
    ru: {
      title: 'Вход на новом устройстве',
      choose: 'Как вы хотите восстановить доступ?',
      optionMaster: 'К кошельку и аккаунту без архива',
      descMaster: 'Только мастер-ключ',
      optionFull: 'С полным архивом аккаунта',
      descFull: 'Мастер-ключ + пароль SEC',
      masterLabel: 'Мастер-ключ (48 цифр)',
      secLabel: 'Пароль SEC (6 блоков по 6 цифр)',
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
      descFull: 'Master key + SEC password',
      masterLabel: 'Master key (48 digits)',
      secLabel: 'SEC password (6 blocks of 6 digits)',
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

  const handleSecChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newSec = [...secPassword];
    const cleaned = value.slice(0, 6);
    newSec[index] = cleaned;
    setSecPassword(newSec);
    setError('');
    if (cleaned.length === 6 && index < 5) {
      secInputRefs.current[index + 1]?.focus();
    }
  };

  const handleSecKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !secPassword[index] && index > 0) {
      secInputRefs.current[index - 1]?.focus();
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
      const secString = secPassword.join('');
      if (secString.length !== 36) {
        setError('Введите все 6 блоков пароля SEC');
        return;
      }
    }
    setIsLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      sessionStorage.removeItem('restore_mode');
      sessionStorage.removeItem('restore_masterKey');
      sessionStorage.removeItem('restore_secPassword');
      onRestore({
        mode,
        masterKey: masterKeyBlocks,
        secPassword: mode === 'full' ? secPassword.join('') : null,
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
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t.title}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t.choose}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setMode('master')}
            className="w-full text-center p-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-all"
          >
            <div className="font-medium text-[var(--text-primary)]">{t.optionMaster}</div>
            <div className="text-sm text-[var(--text-secondary)]">{t.descMaster}</div>
          </button>

          <button
            onClick={() => setMode('full')}
            className="w-full text-center p-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-all"
          >
            <div className="font-medium text-[var(--text-primary)]">{t.optionFull}</div>
            <div className="text-sm text-[var(--text-secondary)]">{t.descFull}</div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          {mode === 'master' ? t.optionMaster : t.optionFull}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {mode === 'master' ? 'Введите мастер-ключ' : 'Введите мастер-ключ и пароль SEC'}
        </p>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
        <p className="text-xs text-[var(--text-secondary)] mb-2 text-center">{t.masterLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {masterKeyBlocks.map((block, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--bg-hover)] text-xs text-[var(--text-secondary)] font-sans flex items-center justify-center font-medium flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-[var(--border-color)] font-light">|</span>
              <input
                ref={(el) => (masterInputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={block}
                onChange={(e) => handleMasterChange(index, e.target.value)}
                onKeyDown={(e) => handleMasterKeyDown(index, e)}
                placeholder="000000"
                className="flex-1 min-w-0 px-2 py-2 text-center font-mono text-lg font-bold text-[var(--text-primary)] border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={6}
                autoFocus={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {mode === 'full' && (
        <>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mt-4">
            <p className="text-xs text-[var(--text-secondary)] mb-2 text-center">{t.secLabel}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {secPassword.map((block, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--bg-hover)] text-xs text-[var(--text-secondary)] font-sans flex items-center justify-center font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-[var(--border-color)] font-light">|</span>
                  <input
                    ref={(el) => (secInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={block}
                    onChange={(e) => handleSecChange(index, e.target.value)}
                    onKeyDown={(e) => handleSecKeyDown(index, e)}
                    placeholder="000000"
                    className="flex-1 min-w-0 px-2 py-2 text-center font-mono text-lg font-bold text-[var(--text-primary)] border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    maxLength={6}
                    autoFocus={index === 0}
                  />
                </div>
              ))}
            </div>
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
        className="w-full text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline text-center"
      >
        ← {lang === 'ru' ? 'Назад' : 'Back'}
      </button>
    </div>
  );
};

export default RestoreScreen;
