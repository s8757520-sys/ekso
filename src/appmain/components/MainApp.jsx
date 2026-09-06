/**
 * File: MainApp.jsx
 * Date: 2026-09-06
 * Purpose: Main application interface after login
 * Description: Displays dashboard with chats, channels, wallet, settings
 * Author: Ekso Team
 */

import { useState, useEffect, useRef } from 'react';
import ChatScreen from '../../modules/chat/components/ChatScreen';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { getPinFromDB } from '../../utils/indexedDB';

const chats = [
  { id: 1, name: 'Алексей', lastMessage: 'Привет! Как дела?', time: '14:30', avatar: 'А' },
  { id: 2, name: 'Мария', lastMessage: 'Договорились!', time: '12:15', avatar: 'М' },
  { id: 3, name: 'Гость #4421', lastMessage: 'Спасибо!', time: '10:02', avatar: 'Г' },
  { id: 4, name: 'Bithom', lastMessage: 'Юра сосед, ККЗ', time: '09:45', avatar: 'Б' },
  { id: 5, name: 'ФРОЛОВ', lastMessage: 'EcoFactor Support...', time: '08:30', avatar: 'Ф' },
  { id: 6, name: 'Вика', lastMessage: 'Сили обороны отримали наказ...', time: '07:15', avatar: 'В' },
];

const MainApp = ({ nickname, publicKey, initialLang = 'ru', onLogout, isNewSession = false }) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState(initialLang);
  const [isPinRequired, setIsPinRequired] = useState(false);
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState('');
  const [storedPin, setStoredPin] = useState(null);
  const inputRefs = useRef([]);

  // Загружаем сохранённый PIN
  useEffect(() => {
    const loadPin = async () => {
      const pin = await getPinFromDB();
      setStoredPin(pin);
      if (pin && !isNewSession) {
        setIsPinRequired(true);
      }
    };
    loadPin();
  }, [isNewSession]);

  // Таймер бездействия (10 секунд для проверки)
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (storedPin) {
          setIsPinRequired(true);
        }
      }, 3 * 60 * 1000); // 3 минуты
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [storedPin]);

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pinInput];
    newPin[index] = value.slice(0, 1);
    setPinInput(newPin);
    setPinError('');
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinInput[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePinSubmit = () => {
    const pinString = pinInput.join('');
    if (pinString.length !== 4) {
      setPinError('Введите 4 цифры');
      return;
    }
    if (pinString === storedPin) {
      setIsPinRequired(false);
      setPinError('');
    } else {
      setPinError('Неверный PIN-код');
      setPinInput(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const openChat = (chat) => {
    setSelectedChat(chat.id);
    setSelectedChatName(chat.name);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        onNavigate={() => {}}
        nickname={nickname}
        publicKey={publicKey}
        lang={lang}
        onLanguageChange={setLang}
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

        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => openChat(chat)}
            className="flex items-center gap-3 py-3 border-b border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-secondary)] transition px-2"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {chat.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[var(--text-primary)] text-sm">{chat.name}</span>
                <span className="text-xs text-[var(--text-secondary)]">{chat.time}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] truncate">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>

      <Footer activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />

      {/* Попап для PIN — затемнённый фон */}
      {isPinRequired && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                {lang === 'ru' ? 'Введите PIN-код' : 'Enter PIN code'}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {lang === 'ru'
                  ? 'Введите 4 цифры для доступа'
                  : 'Enter 4 digits to access'}
              </p>
            </div>

            <div className="flex justify-center gap-3 max-w-xs mx-auto">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="password"
                  maxLength={1}
                  value={pinInput[index] || ''}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-color)]"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-red-500 text-sm text-center mt-3">{pinError}</p>
            )}

            <button
              onClick={handlePinSubmit}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mt-4"
            >
              {lang === 'ru' ? 'Подтвердить' : 'Confirm'}
            </button>

            <button
              onClick={onLogout}
              className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition mt-2"
            >
              {lang === 'ru' ? 'Выйти' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainApp;
