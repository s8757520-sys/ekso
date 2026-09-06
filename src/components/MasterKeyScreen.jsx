/**
 * Файл: MasterKeyScreen.jsx
 * Дата: 2026-09-03
 * Назначение: Экран отображения мастер-ключа (48 цифр) с XRP-кошельком
 * Описание: Показывает ключ, чекбокс подтверждения, кнопку "Далее"
 * Автор: Ekso Team
 */

import { useState } from 'react';
import LanguageToggle from './LanguageToggle';

const MasterKeyScreen = ({ masterKeyData, onNext, lang = 'ru', onToggleLang }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const texts = {
    ru: {
      title: 'Ваш мастер-ключ к профилю Ekso и к XRP-кошельку',
      masterKeyLabel: 'Мастер-ключ (48 цифр)',
      important: '⚠️ Важно:',
      tips: [
        'Запишите мастер-ключ на бумаге',
        'Без него вы не сможете восстановить доступ к аккаунту',
        'Никому не показывайте этот ключ'
      ],
      confirmLabel: 'Я записал(а) мастер-ключ на бумаге',
      next: 'Далее',
    },
    en: {
      title: 'Your master key to your Ekso profile and XRP wallet',
      masterKeyLabel: 'Master key (48 digits)',
      important: '⚠️ Important:',
      tips: [
        'Write down the master key on paper',
        'Without it, you cannot recover access to your account',
        'Never share this key with anyone'
      ],
      confirmLabel: 'I have written down the master key on paper',
      next: 'Next',
    }
  };

  const t = texts[lang] || texts.ru;

  if (!masterKeyData) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-7xl font-bold text-center text-gray-800 font-['Dubtronic'] font-light">
        Ekso
      </h1>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
          {t.title}
        </h2>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4 text-sm text-yellow-700">
        <p className="font-medium">{t.important}</p>
        <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
          {t.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-2 text-center">{t.masterKeyLabel}</p>
        <div className="grid grid-cols-2 gap-2">
          {masterKeyData.blocks.map((block, index) => (
            <div
              key={index}
              className="bg-white rounded-lg px-3 py-2 text-center shadow-sm border border-gray-200 flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-full bg-gray-200 text-xs text-gray-600 font-sans flex items-center justify-center font-medium">
                {index + 1}
              </span>
              <span className="text-gray-300 font-light">|</span>
              <span className="font-mono text-lg font-bold text-gray-800 flex-1">
                {block}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id="confirm-master-key"
          checked={isConfirmed}
          onChange={(e) => setIsConfirmed(e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="confirm-master-key" className="text-sm text-gray-700">
          {t.confirmLabel}
        </label>
      </div>

      <button
        onClick={() => onNext(masterKeyData)}
        disabled={!isConfirmed}
        className={`w-full py-3 px-4 rounded-lg font-medium transition ${
          isConfirmed
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {t.next}
      </button>

      <div className="flex justify-center mt-4">
        <LanguageToggle lang={lang} onToggle={onToggleLang} />
      </div>
    </div>
  );
};

export default MasterKeyScreen;