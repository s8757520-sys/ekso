/**
 * Файл: QuizScreen.jsx
 * Дата: 2026-09-03
 * Назначение: Экран проверки мастер-ключа (Quiz)
 * Описание: Запрашивает один случайный блок из 8 для подтверждения записи
 * Автор: Ekso Team
 */

import { useState } from 'react';
import LanguageToggle from './LanguageToggle';

const QuizScreen = ({ masterKeyData, onNext, lang = 'ru', onToggleLang }) => {
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');

  // ДЛЯ ОТЛАДКИ — делаем masterKeyData доступным в консоли
  window.__masterKeyData = masterKeyData;

  const blockIndex = masterKeyData.quizBlockIndex;

  console.log('🧩 QuizScreen: blockIndex =', blockIndex);

  const texts = {
    ru: {
      title: 'Проверка мастер-ключа',
      subtitle: 'Введите блок, чтобы подтвердить, что вы записали ключ',
      label: `Введите блок №${blockIndex + 1}`,
      hint: '6 цифр',
      button: 'Проверить',
      error: 'Неверный блок. Попробуйте снова.',
    },
    en: {
      title: 'Master key verification',
      subtitle: 'Enter a block to confirm you have written down the key',
      label: `Enter block №${blockIndex + 1}`,
      hint: '6 digits',
      button: 'Check',
      error: 'Invalid block. Try again.',
    }
  };

  const t = texts[lang] || texts.ru;

  const handleSubmit = () => {
    const expected = masterKeyData.blocks[blockIndex];
    if (userInput === expected) {
      setError('');
      onNext();
    } else {
      setError(t.error);
      setUserInput('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-7xl font-bold text-center text-gray-800 font-['Dubtronic'] font-light">
        Ekso
      </h1>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
          {t.title}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t.subtitle}
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-2 text-center">{t.label}</p>
        <div className="flex justify-center">
          <div className="bg-white rounded-lg px-4 py-3 text-center shadow-sm border border-gray-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-xs text-gray-600 font-sans flex items-center justify-center font-medium">
              {blockIndex + 1}
            </span>
            <span className="text-gray-300 font-light">|</span>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-32 text-center font-mono text-lg font-bold text-gray-800 outline-none bg-transparent"
              maxLength={6}
              autoFocus
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {t.hint}
        </p>
      </div>

      {error && (
        <div className="text-center text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={userInput.length !== 6}
        className={`w-full py-3 px-4 rounded-lg font-medium transition ${
          userInput.length === 6
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {t.button}
      </button>

      <div className="flex justify-center mt-4">
        <LanguageToggle lang={lang} onToggle={onToggleLang} />
      </div>
    </div>
  );
};

export default QuizScreen;