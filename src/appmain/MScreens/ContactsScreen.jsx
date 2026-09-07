/**
 * File: ContactsScreen.jsx
 * Date: 2026-09-07
 * Purpose: Contacts management screen
 * Description: Displays list of contacts, allows adding/removing contacts
 * Author: Ekso Team
 * Design: follows ProfileScreen style
 */

import { useState, useEffect } from 'react';

const ContactsScreen = ({ nickname, lang = 'ru', onOpenChat, onBack }) => {
  const [contacts, setContacts] = useState([]);
  const [newContactName, setNewContactName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const texts = {
    ru: {
      title: 'Мои контакты',
      add: 'Добавить контакт',
      addTitle: 'Добавление контакта',
      placeholder: 'Введите никнейм',
      cancel: 'Отмена',
      addButton: 'Добавить',
      empty: 'У вас пока нет контактов',
      emptyHint: 'Нажмите «+», чтобы добавить первого друга',
      error: 'Контакт с таким никнеймом уже есть',
      back: '← Назад',
      chat: 'Чат',
    },
    en: {
      title: 'My Contacts',
      add: 'Add contact',
      addTitle: 'Add contact',
      placeholder: 'Enter nickname',
      cancel: 'Cancel',
      addButton: 'Add',
      empty: 'No contacts yet',
      emptyHint: 'Press «+» to add your first friend',
      error: 'Contact with this nickname already exists',
      back: '← Back',
      chat: 'Chat',
    }
  };

  const t = texts[lang] || texts.ru;

  useEffect(() => {
    const saved = localStorage.getItem('contacts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setContacts(parsed);
        }
      } catch (e) {
        console.error('Error loading contacts:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleAddContact = () => {
    const trimmedName = newContactName.trim();
    if (!trimmedName) return;

    if (contacts.some(c => (c.id || c.name) === trimmedName)) {
      alert(t.error);
      return;
    }

    const newContact = {
      id: trimmedName,
      name: trimmedName,
      displayName: trimmedName,
      avatar: null,
      lastMessage: '',
      time: '',
    };

    setContacts([...contacts, newContact]);
    setNewContactName('');
    setShowAddModal(false);
  };

  const handleRemoveContact = (contactId) => {
    if (window.confirm(`Удалить контакт ${contactId}?`)) {
      setContacts(contacts.filter(c => (c.id || c.name) !== contactId));
    }
  };

  const openChat = (contact) => {
    if (onOpenChat) {
      onOpenChat(contact);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-6 md:p-8">
        
        {/* Заголовок как в профиле */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack} 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-sm md:text-base"
          >
            ← {lang === 'ru' ? 'Назад' : 'Back'}
          </button>
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)]">{t.title}</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-2xl flex items-center justify-center transition"
          >
            +
          </button>
        </div>

        {/* Список контактов (карточки как в профиле) */}
        {contacts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-[var(--text-secondary)]">{t.empty}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">{t.emptyHint}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => {
              const displayName = contact.displayName || contact.name || contact.id;
              const firstLetter = displayName.charAt(0).toUpperCase();
              
              return (
                <div
                  key={contact.id || contact.name}
                  onClick={() => openChat(contact)}
                  className="flex items-center gap-3 py-3 px-4 bg-[var(--bg-primary)] rounded-xl hover:bg-[var(--bg-hover)] transition cursor-pointer border border-[var(--border-color)]"
                >
                  {/* Аватарка как в профиле */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{firstLetter}</span>
                    )}
                  </div>
                  
                  {/* Имя и никнейм */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--text-primary)]">
                      {displayName}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      @{contact.id || contact.name}
                    </div>
                  </div>
                  
                  {/* Кнопка удаления */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveContact(contact.id || contact.name);
                    }}
                    className="text-[var(--text-secondary)] hover:text-red-500 transition text-lg px-2"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модалка добавления контакта (как модалка выхода в профиле) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-primary)] rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl border border-[var(--border-color)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              {t.addTitle}
            </h3>
            <input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder={t.placeholder}
              className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 px-4 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleAddContact}
                className="flex-1 py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                {t.addButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsScreen;