/**
 * Файл: OnboardingLayoutES.jsx
 * Дата: 2026-09-06
 * Назначение: Общий шаблон для EntryScreen (первый экран)
 * Описание: Добавляет хедер, футер и ссылку "На главную"
 * Автор: Ekso Team
 */

import LanguageToggle from './LanguageToggle';
import { useTheme } from '../context/ThemeContext';

const OnboardingLayoutES = ({ children, lang = 'ru', onToggleLang }) => {
  const { theme } = useTheme();

  const logoSrc = theme === 'light'
    ? '/ekso-logo-bl.svg'
    : '/ekso-logo-w.svg';

  const texts = {
    ru: {
      subtitle: 'Добро пожаловать в твой цифровой суверенитет',
      footer: 'Суверенное право человека оставаться хозяином своих мыслей, слов и капитала — это и есть приватность',
      home: 'На главную',
    },
    en: {
      subtitle: 'Welcome to your digital sovereignty',
      footer: 'The sovereign right of a person to remain the master of their thoughts, words, and capital — that is privacy',
      home: 'Home',
    }
  };

  const t = texts[lang] || texts.ru;

  return (
    <div className="space-y-6">
      {/* Хедер с логотипом */}
      <div className="text-center">
        <img
          src={logoSrc}
          alt="Ekso"
          className="h-12 w-auto mx-auto mb-2"
        />
        <p className="text-center text-[var(--text-secondary)] text-sm mt-1">
          {t.subtitle}
        </p>
        <hr className="border-[var(--border-color)] mt-4" />
      </div>

      {/* Содержимое */}
      <div>{children}</div>

      {/* Футер */}
      <div className="pt-4 border-t border-[var(--border-color)]">
        <p className="text-xs text-center text-[var(--text-secondary)] italic leading-relaxed">
          {t.footer}
        </p>
        <div className="flex justify-between items-center mt-3">
          <a
            href="https://ekso.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
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
