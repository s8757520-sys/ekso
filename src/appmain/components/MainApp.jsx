/**
 * File: MainApp.jsx
 * Date: 2026-09-08
 * Purpose: Main application interface after login
 * Description: Displays dashboard with chats, channels, wallet, settings
 * Author: Ekso Team
 * Updated: Использует WebSocketContext вместо прямого вызова useWebSocket
 */

import { useState, useEffect } from 'react';
import ChatScreen from '../../modules/chat/components/ChatScreen';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import ProfileScreen from '../MScreens/ProfileScreen';
import ContactsScreen from '../MScreens/ContactsScreen';
import { useWebSocketContext } from '../../context/WebSocketContext';

const getFullAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('/avatars/')) return `https://ekso.me${avatar}`;
  return avatar;
};

const MainApp = ({ nickname, publicKey, initialLang = 'ru', onNavigate }) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState('');
  const [selectedChatAvatar, setSelectedChatAvatar] = useState(null);
  const [selectedChatDisplayName, setSelectedChatDisplayName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState(initialLang);
  const [currentScreen, setCurrentScreen] = useState('chats');
  const [chats, setChats] = useState([]);

  const { isConnected, sendMessage, lastMessage } = useWebSocketContext();

  // Загружаем чаты из localStorage
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
    setChats([]);
  }, []);

  // Сохраняем чаты в localStorage при их изменении
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('contacts', JSON.stringify(chats));
    }
  }, [chats]);

  // ========== ЗАГРУЗКА ПРОФИЛЯ С СЕРВЕРА ==========
  useEffect(() => {
    if (isConnected && nickname) {
      sendMessage('get_profile', { nickname });
    }
  }, [isConnected, nickname]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'get_profile_result') {
      const data = lastMessage.payload;
      if (data.profile) {
        if (data.profile.displayName) {
          localStorage.setItem('ekso_display_name', data.profile.displayName);
        }
        if (data.profile.avatar) {
          const fullUrl = getFullAvatarUrl(data.profile.avatar);
          localStorage.setItem('ekso_avatar', fullUrl);
        }
      }
    }
  }, [lastMessage]);

  // ========== ОБРАБОТКА ВХОДЯЩИХ СООБЩЕНИЙ ==========
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'chat_message') {
      const payload = lastMessage.payload;
      console.log('📩 Новое сообщение от', payload.from, ':', payload.text);

      setChats(prevChats => {
        const chatId = payload.chatId || `chat_${[nickname, payload.from].sort().join('_')}`;
        const existingChat = prevChats.find(c => c.id === chatId || c.name === payload.from);
        
        if (existingChat) {
          return prevChats.map(c => 
            (c.id === chatId || c.name === payload.from) 
              ? { ...c, lastMessage: payload.text, time: new Date(payload.timestamp).toLocaleTimeString(), unread: true }
              : c
          );
        } else {
          const newChat = {
            id: chatId,
            name: payload.from,
            displayName: payload.from,
            avatar: null,
            lastMessage: payload.text,
            time: new Date(payload.timestamp).toLocaleTimeString(),
            unread: true
          };
          return [newChat, ...prevChats];
        }
      });
    }
  }, [lastMessage, nickname]);

  const openChat = (chat) => {
    setSelectedChat(chat.id);
    setSelectedChatName(chat.name || chat.id);
    setSelectedChatDisplayName(chat.displayName || chat.name || chat.id);
    setSelectedChatAvatar(getFullAvatarUrl(chat.avatar));
    
    setChats(prevChats => 
      prevChats.map(c => 
        c.id === chat.id ? { ...c, unread: false } : c
      )
    );
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
    if (page === 'contacts') {
      setCurrentScreen('contacts');
      return;
    }
    if (page === 'logout') {
      onNavigate('logout');
      return;
    }
    console.log('Navigate to:', page);
    setCurrentScreen(page);
  };

  const handleShareProfile = () => {
    const link = `https://ekso.me/connect_with/@${nickname}`;
    navigator.clipboard.writeText(link);
    alert(lang === 'ru' ? 'Ссылка на профиль скопирована!' : 'Profile link copied!');
  };

  const handleGuestChat = () => {
    alert(lang === 'ru' 
      ? 'Гостевой чат будет доступен в ближайшее время' 
      : 'Guest chat will be available soon'
    );
  };

  // ========== ЛИЧНЫЙ ЧАТ ==========
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
          <ChatScreen 
            lang={lang} 
            nickname={nickname} 
            recipient={selectedChatName}
            recipientDisplayName={selectedChatDisplayName}
            recipientAvatar={selectedChatAvatar}
          />
        </div>
      </div>
    );
  }

  // ========== ПРОФИЛЬ ==========
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

  // ========== КОНТАКТЫ ==========
  if (currentScreen === 'contacts') {
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
          activeScreen="contacts"
        />
        <Header onMenuClick={toggleSidebar} />
        <div className="flex-1 overflow-y-auto">
          <ContactsScreen
            nickname={nickname}
            lang={lang}
            onBack={() => setCurrentScreen('chats')}
            onOpenChat={(contact) => {
              setSelectedChat(contact.id || contact.name);
              setSelectedChatName(contact.name || contact.id);
              setSelectedChatDisplayName(contact.displayName || contact.name || contact.id);
              setSelectedChatAvatar(contact.avatar || null);
              setCurrentScreen('chat');
            }}
          />
        </div>
        <Footer activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />
      </div>
    );
  }

  // ========== ГЛАВНАЯ СТРАНИЦА (СПИСОК ЧАТОВ) ==========
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
          <div className="text-center py-12 px-4">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              {lang === 'ru' ? 'У вас пока нет чатов' : 'No chats yet'}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              {lang === 'ru' 
                ? 'Начните общение с друзьями в Ekso' 
                : 'Start chatting with friends on Ekso'}
            </p>
            
            <div className="space-y-3 max-w-sm mx-auto">
              <button 
                onClick={() => handleNavigate('contacts')}
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition text-sm font-medium"
              >
                {lang === 'ru' ? '➕ Добавить контакт' : '➕ Add contact'}
              </button>
              
              <button 
                onClick={handleShareProfile}
                className="w-full py-3 px-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-xl transition text-sm font-medium"
              >
                {lang === 'ru' ? '🔗 Отправить ссылку на профиль' : '🔗 Share profile link'}
              </button>
              
              <button 
                onClick={handleGuestChat}
                className="w-full py-3 px-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-xl transition text-sm font-medium"
              >
                {lang === 'ru' ? '👤 Начать гостевой чат' : '👤 Start guest chat'}
              </button>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] mt-6">
              {lang === 'ru' 
                ? 'Гостевой чат — общение без регистрации, сессия живёт 24 часа' 
                : 'Guest chat — chat without registration, session lasts 24 hours'}
            </p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => openChat(chat)}
              className="flex items-center gap-3 py-3 border-b border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-secondary)] transition px-2"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {chat.avatar ? (
                  <img 
                    src={getFullAvatarUrl(chat.avatar)} 
                    alt={chat.displayName || chat.name || chat.id} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span>{(chat.displayName || chat.name || chat.id).charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[var(--text-primary)] text-sm">
                    {chat.displayName || chat.name || chat.id}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{chat.time || '—'}</span>
                  {chat.unread ? (
                    <span className="w-3 h-3 bg-green-500 rounded-full inline-block ml-2 animate-pulse"></span>
                  ) : (
                    <span className="w-3 h-3 bg-gray-400 rounded-full inline-block ml-2"></span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)] truncate">
                  {chat.unread ? '📩 Есть новое сообщение' : (chat.lastMessage || 'Нет сообщений')}
                </p>
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
