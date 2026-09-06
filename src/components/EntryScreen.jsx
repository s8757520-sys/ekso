/**
 * Файл: EntryScreen.jsx
 * Дата: 2026-09-04
 * Назначение: Первый экран — выбор пути входа
 * Описание: Четыре варианта в минималистичном стиле
 * Автор: Ekso Team
 */

const EntryScreen = ({ onSelect, lang = 'ru' }) => {
  const texts = {
    ru: {
      login: 'Войти в аккаунт',
      create: 'Создать аккаунт',
      restore: 'Вход на новом устройстве',
      wallet: 'Войти в кошелёк',
      descLogin: 'Нужен PIN-код или биометрия',
      descCreate: 'Приготовь бумагу и карандаш',
      descRestore: 'Приготовь мастер-ключ + PIN',
      descWallet: 'Только кошелёк, без аккаунта Ekso',
    },
    en: {
      login: 'Log in to Account',
      create: 'Create Account',
      restore: 'Login on new device',
      wallet: 'Access Wallet',
      descLogin: 'PIN or biometrics required',
      descCreate: 'Get paper and pencil ready',
      descRestore: 'Get master key + PIN ready',
      descWallet: 'Wallet only, without Ekso account',
    }
  };

  const t = texts[lang] || texts.ru;

  const items = [
    { id: 'login', label: t.login, desc: t.descLogin },
    { id: 'create', label: t.create, desc: t.descCreate },
    { id: 'restore', label: t.restore, desc: t.descRestore },
    { id: 'wallet', label: t.wallet, desc: t.descWallet },
  ];

  return (
    <div className="space-y-3 pt-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="w-full text-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-all"
        >
          <div className="font-medium text-gray-800">{item.label}</div>
          <div className="text-sm text-gray-400">{item.desc}</div>
        </button>
      ))}
    </div>
  );
};

export default EntryScreen;