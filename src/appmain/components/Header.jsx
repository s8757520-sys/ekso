/**
 * File: Header.jsx
 * Date: 2026-09-05
 * Purpose: Top navigation bar for the main app
 * Description: Displays menu button, logo, and theme toggle
 * Author: Ekso Team
 */

import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-[var(--bg-secondary)] px-3 sm:px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)]">
      <span
        onClick={onMenuClick}
        className="text-2xl sm:text-3xl text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition"
      >
        ☰
      </span>

      <h1
        translate="no"
        className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-['Dubtronic'] font-light"
      >
        Ekso
      </h1>

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