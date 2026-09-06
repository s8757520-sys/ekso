/**
 * Файл: OnboardingLayoutES.jsx
 * Дата: 2026-09-04
 * Назначение: Общий шаблон для EntryScreen (первый экран)
 * Описание: Добавляет хедер, футер и ссылку "На главную"
 * Автор: Ekso Team
 */

import LanguageToggle from './LanguageToggle';

const OnboardingLayoutES = ({ children, lang = 'ru', onToggleLang }) => {
  const texts = {
    ru: {
      title: 'Ekso',
      subtitle: 'Добро пожаловать в твой цифровой суверенитет',
      footer: 'Суверенное право человека оставаться хозяином своих мыслей, слов и капитала — это и есть приватность',
      home: 'На главную',
    },
    en: {
      title: 'Ekso',
      subtitle: 'Welcome to your digital sovereignty',
      footer: 'The sovereign right of a person to remain the master of their thoughts, words, and capital — that is privacy',
      home: 'Home',
    }
  };

  const t = texts[lang] || texts.ru;

  return (
    <div className="space-y-6">
      {/* Хедер */}
      <div className="text-center">
        <h1 className="text-7xl font-bold text-center text-gray-800 font-['Dubtronic'] font-light">
          {t.title}
        </h1>
        <p className="text-center text-gray-500 text-sm mt-1">
          {t.subtitle}
        </p>
        <hr className="border-gray-200 mt-4" />
      </div>

      {/* Содержимое */}
      <div>{children}</div>

      {/* Футер */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500 italic leading-relaxed">
          {t.footer}
        </p>
        <div className="flex justify-between items-center mt-3">
          <a
            href="https://ekso.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            {t.home}
          </a>
          <LanguageToggle lang={lang} onToggle={onToggleLang} />
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayoutES;