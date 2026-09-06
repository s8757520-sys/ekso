/**
 * File: Footer.jsx
 * Date: 2026-09-05
 * Purpose: Bottom navigation bar — fixed at the bottom of the screen
 * Description: Contains quick access tabs: Chats, Channels, Wallet, Settings
 * Author: Ekso Team
 */

const Footer = ({ activeTab, onTabChange, lang = 'ru' }) => {
    const texts = {
      ru: {
        chats: 'Чаты',
        channels: 'Каналы',
        wallet: 'Кошелёк',
        settings: 'Настройки',
      },
      en: {
        chats: 'Chats',
        channels: 'Channels',
        wallet: 'Wallet',
        settings: 'Settings',
      },
    };
  
    const t = texts[lang] || texts.ru;
  
    const tabs = [
      { id: 'chats', label: t.chats, icon: '📩' },
      { id: 'channels', label: t.channels, icon: '📢' },
      { id: 'wallet', label: t.wallet, icon: '💰' },
      { id: 'settings', label: t.settings, icon: '⚙️' },
    ];
  
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex justify-around items-center py-2 px-4 z-30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 transition ${
              activeTab === tab.id
                ? 'text-blue-500'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };
  
  export default Footer;