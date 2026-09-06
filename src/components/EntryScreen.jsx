/**
 * Файл: EntryScreen.jsx
 * Дата: 2026-09-06
 * Назначение: Первый экран онбординга
 * Описание: Показывает разные кнопки в зависимости от наличия данных в IndexedDB
 * Автор: Ekso Team
 */

const EntryScreen = ({ onSelect, lang = 'ru', hasSession }) => {
  const texts = {
    ru: {
      login: 'Войти в аккаунт',
      create: 'Создать аккаунт',
      restore: 'Вход на новом устройстве',
      wallet: 'Войти в кошелёк',
      descLogin: 'PIN-код или биометрия',
      descCreate: 'Приготовь бумагу и карандаш',
      descRestore: 'Приготовь мастер-ключ + PIN',
      descWallet: 'Только кошелёк, без аккаунта',
    },
    en: {
      login: 'Log in to Account',
      create: 'Create Account',
      restore: 'Login on new device',
      wallet: 'Access Wallet',
      descLogin: 'PIN or biometrics',
      descCreate: 'Get paper and pencil ready',
      descRestore: 'Get master key + PIN ready',
      descWallet: 'Wallet only, no account',
    }
  };

  const t = texts[lang] || texts.ru;

  // Если есть данные в IndexedDB — показываем только вход + кошелёк
  if (hasSession) {
    return (
      <div className="space-y-3 pt-4">
        <button
          onClick={() => onSelect('login')}
          className="w-full text-center p-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-all"
        >
          <div className="font-medium text-[var(--text-primary)]">{t.login}</div>
          <div className="text-sm text-[var(--text-secondary)]">{t.descLogin}</div>
        </button>

        <button
          onClick={() => onSelect('wallet')}
          className="w-full text-center p-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-all"
        >
          <div className="font-medium text-[var(--text-primary)]">{t.wallet}</div>
          <div className="text-sm text-[var(--text-secondary)]">{t.descWallet}</div>
        </button>
      </div>
    );
  }

  // Если данных нет — показываем все варианты
  const items = [
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
          className="w-full text-center p-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-all"
        >
          <div className="font-medium text-[var(--text-primary)]">{item.label}</div>
          <div className="text-sm text-[var(--text-secondary)]">{item.desc}</div>
        </button>
      ))}
    </div>
  );
};

export default EntryScreen;
