/**
 * File: Header.jsx
 * Date: 2026-09-06
 * Purpose: Top navigation bar for the main app
 * Description: Displays menu button, logo images (light/dark), and theme toggle
 * Author: Ekso Team
 */

import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  const logoSrc = theme === 'light'
    ? '/ekso-logo-bl.svg'
    : '/ekso-logo-w.svg';

  return (
    <div className="bg-[var(--bg-secondary)] px-3 sm:px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)]">
      <span
        onClick={onMenuClick}
        className="text-2xl sm:text-3xl text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition"
      >
        ☰
      </span>

      <img
        src={logoSrc}
        alt="Ekso"
        className="h-12 sm:h-16 w-auto"
      />

      <button
        onClick={toggleTheme}
        className="text-xl cursor-pointer hover:scale-110 transition text-[var(--text-secondary)]"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
};

export default Header;
