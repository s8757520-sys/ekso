/**
 * Файл: LanguageToggle.jsx
 * Дата: 2026-09-03
 * Назначение: Компонент переключателя языка (цветные флаги)
 * Описание: Отображает флаг текущего языка без текста.
 * Автор: Ekso Team
 */

const LanguageToggle = ({ lang, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-3xl leading-none"
      title={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
    >
      {lang === 'ru' ? '🇺🇸' : '🇷🇺'}
    </button>
  );
};

export default LanguageToggle;