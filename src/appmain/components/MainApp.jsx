/**
 * File: MainApp.jsx
 * Date: 2026-09-07
 * Purpose: Main application interface after login
 * Description: Displays dashboard with chats, channels, wallet, settings
 * Author: Ekso Team
 * Updated: Список чатов теперь читается из localStorage (динамический)
 */

import { useState, useEffect } from 'react';
import ChatScreen from '../../modules/chat/components/ChatScreen';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import ProfileScreen from '../MScreens/ProfileScreen';

// Дефолтные чаты (если в localStorage пусто)
const defaultChats = [
  { id: 1, name: 'Алексей', lastMessage: 'Привет! Как дела?', time: '14:30', avatar: 'А' },
  { id: 2, name: 'Мария', lastMessage: 'Договорились!', time: '12:15', avatar: 'М' },
  { id: 3, name: 'Гость #4421', lastMessage: 'Спасибо!', time: '10:02', avatar: 'Г' },
  { id: 4, name: 'Bithom', lastMessage: 'Юра сосед, ККЗ', time: '09:45', avatar: 'Б' },
  { id: 5, name: 'ФРОЛОВ', lastMessage: 'EcoFactor Support...', time: '08:30', avatar: 'Ф' },
  { id: 6, name: 'Вика', lastMessage: 'Сили обороны отримали наказ...', time: '07:15', avatar: 'В' },
];

const MainApp = ({ nickname, publicKey, initialLang = 'ru', onNavigate }) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState(initialLang);
  const [currentScreen, setCurrentScreen] = useState('chats');
  const [chats, setChats] = useState([]);

  // Загружаем чаты из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem('contacts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChats(parsed);
          return;
        }
      } catch (e) {
        console.error('Ошибка парсинга contacts из localStorage:', e);
      }
    }
    // Если в localStorage пусто — используем дефолтные
    setChats(defaultChats);
  }, []);

  // Сохраняем чаты в localStorage при их изменении
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('contacts', JSON.stringify(chats));
    }
  }, [chats]);

  const openChat = (chat) => {
    setSelectedChat(chat.id);
    setSelectedChatName(chat.name);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigate = (page) => {
    if (page === 'profile') {
      setCurrentScreen('profile');
      return;
    }
    if (page === 'chats') {
      setCurrentScreen('chats');
      return;
    }
    if (page === 'logout') {
      onNavigate('logout');
      return;
    }
    console.log('Navigate to:', page);
    setCurrentScreen(page);
  };

  if (selectedChat) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <button
          onClick={() => setSelectedChat(null)}
          className="p-3 text-blue-500 font-medium"
        >
          ← Назад к чатам
        </button>
        <div className="w-full px-2 sm:px-4">
          <ChatScreen lang={lang} nickname={selectedChatName} />
        </div>
      </div>
    );
  }

  // Если открыт профиль
  if (currentScreen === 'profile') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          onNavigate={handleNavigate}
          nickname={nickname}
          publicKey={publicKey}
          lang={lang}
          onLanguageChange={setLang}
          activeScreen={currentScreen}
        />
        <Header onMenuClick={toggleSidebar} />
        <div className="flex-1 overflow-y-auto">
          <ProfileScreen
            nickname={nickname}
            publicKey={publicKey}
            lang={lang}
            onBack={() => setCurrentScreen('chats')}
          />
        </div>
        <Footer activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        onNavigate={handleNavigate}
        nickname={nickname}
        publicKey={publicKey}
        lang={lang}
        onLanguageChange={setLang}
        activeScreen={currentScreen}
      />

      <Header onMenuClick={toggleSidebar} />

      <div className="flex-1 overflow-y-auto w-full px-2 sm:px-4 bg-[var(--bg-primary)] pb-24">
        <div className="py-2 text-sm font-semibold text-[var(--text-secondary)]">
          Чаты
        </div>

        <div className="mb-2">
          <input
            type="text"
            placeholder="Поиск"
            className="w-full px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-primary)] outline-none border border-[var(--border-color)] placeholder:text-[var(--text-secondary)]"
          />
        </div>

        {chats.length === 0 ? (
          <div className="text-center text-[var(--text-secondary)] py-8">
            Нет чатов. Начните диалог с новым контактом.
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => openChat(chat)}
              className="flex items-center gap-3 py-3 border-b border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-secondary)] transition px-2"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {chat.avatar || chat.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[var(--text-primary)] text-sm">{chat.name}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{chat.time || '—'}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] truncate">{chat.lastMessage || 'Нет сообщений'}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <Footer activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />
    </div>
  );
};

export default MainApp;
