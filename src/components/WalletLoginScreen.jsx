/**
 * File: WalletLoginScreen.jsx
 * Date: 2026-09-04
 * Purpose: Wallet login screen (master key only, no Ekso account)
 * Description: User enters 48-digit master key to access XRP wallet.
 *              Step 1: tutorial with checkbox.
 *              Step 2: master key entry (8 blocks of 6 digits).
 * Author: Ekso Team
 */

import { useState, useRef } from 'react';

const WalletLoginScreen = ({ onLogin, lang = 'ru' }) => {
  const [step, setStep] = useState('tutorial');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [masterKeyBlocks, setMasterKeyBlocks] = useState(Array(8).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const masterInputRefs = useRef([]);

  const texts = {
    ru: {
      title: 'Вход в кошелёк',
      tutorialText:
        'Вы получите доступ к своему XRP кошельку без создания учётной записи в Ekso. Вам будет доступен баланс, история транзакций, а также возможность отправлять и получать XRP/RLUSD.',
      confirmLabel: 'Я понимаю, что получу доступ только к своему XRP кошельку',
      next: 'Далее',
      masterLabel: 'Мастер-ключ (48 цифр)',
      enterKey: 'Введите мастер-ключ',
      login: 'Войти в кошелёк',
      loading: 'Проверка...',
      error: 'Неверный мастер-ключ. Попробуйте снова.',
    },
    en: {
      title: 'Access Wallet',
      tutorialText:
        'You will get access to your XRP wallet without creating an Ekso account. You will have access to balance, transaction history, and the ability to send and receive XRP/RLUSD.',
      confirmLabel: 'I understand that I will only get access to my XRP wallet',
      next: 'Next',
      masterLabel: 'Master key (48 digits)',
      enterKey: 'Enter master key',
      login: 'Access Wallet',
      loading: 'Checking...',
      error: 'Invalid master key. Please try again.',
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

    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLogin({
        blocks: masterKeyBlocks,
        full: fullKey,
        formatted: masterKeyBlocks.join(' '),
      });
    } catch (err) {
      setError(t.error);
      setIsLoading(false);
    }
  };

  // ========== STEP 1: TUTORIAL ==========
  if (step === 'tutorial') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t.title}</h2>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 text-sm text-[var(--text-primary)] text-center">
          {t.tutorialText}
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="confirm-wallet"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="confirm-wallet" className="text-sm text-[var(--text-primary)]">
            {t.confirmLabel}
          </label>
        </div>

        <button
          onClick={() => setStep('masterKey')}
          disabled={!isConfirmed}
          className={`w-full py-3 px-4 rounded-lg font-medium transition ${
            isConfirmed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t.next}
        </button>
      </div>
    );
  }

  // ========== STEP 2: MASTER KEY ENTRY ==========
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t.enterKey}</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{t.masterLabel}</p>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
        <p className="text-xs text-[var(--text-secondary)] mb-2 text-center">{t.masterLabel}</p>
        <div className="grid grid-cols-2 gap-2">
          {masterKeyBlocks.map((block, index) => (
            <div
              key={index}
              className="bg-[var(--bg-primary)] rounded-lg px-3 py-2 text-center shadow-sm border border-[var(--border-color)] flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-full bg-[var(--bg-hover)] text-xs text-[var(--text-secondary)] font-sans flex items-center justify-center font-medium flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-[var(--border-color)] font-light">|</span>
              <input
                ref={(el) => (masterInputRefs.current[index] = el)}
                type="text"
                value={block}
                onChange={(e) => handleMasterChange(index, e.target.value)}
                onKeyDown={(e) => handleMasterKeyDown(index, e)}
                placeholder="000000"
                className="flex-1 min-w-0 bg-transparent text-center font-mono text-lg font-bold text-[var(--text-primary)] outline-none"
                maxLength={6}
                autoFocus={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

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
        {isLoading ? t.loading : t.login}
      </button>
    </div>
  );
};

export default WalletLoginScreen;
