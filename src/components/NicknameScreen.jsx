/**
 * Файл: NicknameScreen.jsx
 * Дата: 2026-09-04
 * Назначение: Экран выбора никнейма для нового аккаунта
 * Описание: Пользователь вводит никнейм, проверяет доступность через WebSocket
 * Автор: Ekso Team
 */

const NicknameScreen = ({
    nickname,
    setNickname,
    status,
    isLoading,
    isConnected,
    checkNickname,
    lang = 'ru',
  }) => {
    const texts = {
      ru: {
        subtitle: 'Придумайте уникальный никнейм',
        label: 'Никнейм',
        placeholder: 'например, alex',
        hint: 'от 3 до 20 символов, только латиница и цифры',
        button: 'Проверить никнейм',
        loading: 'Проверка...',
        errorShort: 'Минимум 3 символа',
        checking: 'Проверка...',
        available: 'Никнейм доступен!',
        taken: 'Никнейм уже занят',
        serverError: 'Ошибка сервера',
        invalidChars: 'Только латиница и цифры',
        noConnection: 'Нет соединения с сервером. Проверьте интернет.',
      },
      en: {
        subtitle: 'Choose a unique nickname',
        label: 'Nickname',
        placeholder: 'e.g., alex',
        hint: '3 to 20 characters, only letters and numbers',
        button: 'Check nickname',
        loading: 'Checking...',
        errorShort: 'Minimum 3 characters',
        checking: 'Checking...',
        available: 'Nickname is available!',
        taken: 'Nickname is already taken',
        serverError: 'Server error',
        invalidChars: 'Only Latin letters and numbers',
        noConnection: 'No connection to the server. Check your internet.',
      }
    };
  
    const t = texts[lang] || texts.ru;
  
    const getStatusStyle = () => {
      if (status.includes('доступен') || status.includes('available')) {
        return 'bg-green-50 text-green-600';
      }
      if (status.includes('занят') || status.includes('taken')) {
        return 'bg-red-50 text-red-600';
      }
      if (status.includes('Проверка') || status.includes('Checking')) {
        return 'bg-blue-50 text-blue-600';
      }
      return 'bg-blue-50 text-blue-600';
    };
  
    return (
      <div className="space-y-4">
        <p className="text-center text-gray-700 font-medium">
          {t.subtitle}
        </p>
  
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.label}
          </label>
          <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <span className="bg-gray-100 px-3 py-2 text-gray-500">@</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 px-3 py-2 outline-none"
              maxLength={20}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {t.hint}
          </p>
        </div>
  
        {status && (
          <div className={`p-3 rounded-lg text-center ${getStatusStyle()}`}>
            {status}
          </div>
        )}
  
        <button
          onClick={checkNickname}
          disabled={isLoading || !nickname || !isConnected}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? t.loading : t.button}
        </button>
      </div>
    );
  };
  
  export default NicknameScreen;