/**
 * File: App.jsx
 * Date: 2026-09-06
 * Purpose: Main application component for Ekso onboarding
 * Description: Manages routing between onboarding screens:
 *          EntryScreen, LoginScreen, RestoreScreen, WalletLoginScreen,
 *          account creation, master key, Quiz, PIN, finalization.
 *          Also handles language state, WebSocket, master key.
 *          IMPORTANT: MainApp is rendered OUTSIDE the onboarding card
 *          to ensure it appears as a separate full-page interface.
 * Author: Ekso Team
 */

import { useState, useEffect, useRef } from 'react';
import LanguageToggle from './components/LanguageToggle';
import { useWebSocket } from './hooks/useWebSocket';
import PinScreen from './components/PinScreen';
import MasterKeyScreen from './components/MasterKeyScreen';
import QuizScreen from './components/QuizScreen';
import EntryScreen from './components/EntryScreen';
import OnboardingLayout from './components/OnboardingLayout';
import OnboardingLayoutES from './components/OnboardingLayoutES';
import LoginScreen from './components/LoginScreen';
import RestoreScreen from './components/RestoreScreen';
import WalletLoginScreen from './components/WalletLoginScreen';
import NicknameScreen from './components/NicknameScreen';
import MainApp from './appmain/components/MainApp';
import { generateMasterKey } from './utils/generateMasterKey';
import { encryptMasterKey } from './utils/encryption';
import { saveUserData, loadUserData, savePin } from './utils/indexedDB';

function App() {
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('ekso-lang') || 'ru';
  });
  const [step, setStep] = useState('nickname');
  const [masterKeyData, setMasterKeyData] = useState(null);
  const [entryMode, setEntryMode] = useState(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const lastMessageRef = useRef(null);
  const isMasterKeyGenerated = useRef(false);

  const { isConnected, sendMessage, lastMessage } = useWebSocket('wss://ekso.me/ws');

  const isValidNickname = (value) => {
    return /^[a-zA-Z0-9]+$/.test(value);
  };

  const texts = {
    ru: {
      title: 'Добро пожаловать в твой цифровой суверенитет',
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
      footer: 'Суверенное право человека оставаться хозяином своих мыслей, слов и капитала — это и есть приватность',
    },
    en: {
      title: 'Welcome to your digital sovereignty',
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
      footer: 'The sovereign right of a person to remain the master of their thoughts, words, and capital — that is privacy',
    }
  };

  const t = texts[lang];

  useEffect(() => {
    const checkBiometrics = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsBiometricAvailable(available);
        } catch {
          setIsBiometricAvailable(false);
        }
      }
    };
    checkBiometrics();
  }, []);

  // Check for existing session on load
  useEffect(() => {
    const checkLocalSession = async () => {
      const data = await loadUserData();
      setHasSession(!!data);
      if (data) {
        console.log('🔐 Existing session found');
        setNickname(data.nickname || '');
        setEntryMode(null);
        setStep('login');
      } else {
        setEntryMode(null);
      }
    };
    checkLocalSession();
  }, []);

  useEffect(() => {
    if (!masterKeyData && !isMasterKeyGenerated.current) {
      isMasterKeyGenerated.current = true;
      const key = generateMasterKey();
      const blockIndex = Math.floor(Math.random() * 8);
      setMasterKeyData({ ...key, quizBlockIndex: blockIndex });
    }
  }, []);

  const checkNickname = async () => {
    if (!nickname || nickname.length < 3) {
      setStatus(t.errorShort);
      return;
    }

    if (!isValidNickname(nickname)) {
      setStatus(t.invalidChars);
      return;
    }

    setIsLoading(true);
    setStatus(t.checking);

    const sent = sendMessage('check_nickname', { nickname });
    if (!sent) {
      setStatus(t.noConnection);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessageRef.current === lastMessage) return;

    lastMessageRef.current = lastMessage;

    const { type, payload } = lastMessage;

    if (type === 'check_nickname_result') {
      setIsLoading(false);
      if (payload.available) {
        setStatus(texts[lang].available);
        setStep('masterKey');
      } else {
        setStatus(texts[lang].taken);
      }
    }

    if (type === 'error') {
      setIsLoading(false);
      setStatus(`Ошибка: ${payload.message}`);
    }
  }, [lastMessage, lang]);

  const toggleLang = () => {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    setLang(newLang);
    localStorage.setItem('ekso-lang', newLang);
  };

  const handleEntrySelect = (mode) => {
    setEntryMode(mode);
    if (mode === 'create') {
      setStep('nickname');
    } else if (mode === 'login') {
      setStep('login');
    } else if (mode === 'restore') {
      setStep('restore');
    } else if (mode === 'wallet') {
      setStep('walletLogin');
    }
  };

  const handleBack = () => {
    setEntryMode(null);
    setStep('nickname');
  };

  const handleMasterKeyGenerated = () => {
    setStep('quiz');
  };

  const handleQuizSuccess = () => {
    setStep('pin');
  };

  const handlePinConfirmed = async (pin) => {
    try {
      await savePin(pin);
      const encryptedData = await encryptMasterKey(masterKeyData.full, pin);
      await saveUserData({
        nickname: nickname,
        publicKey: masterKeyData.wallet.publicKey,
        encryptedMasterKey: encryptedData,
      });

      sendMessage('register_nickname', {
        nickname: nickname,
        publicKey: masterKeyData.wallet.publicKey,
      });

      console.log('✅ Data saved to IndexedDB and sent to server');
      setStep('main');
    } catch (error) {
      console.error('❌ Finalization error:', error);
      setStep('main');
    }
  };

  const handleLogin = (pinOrBiometric) => {
    console.log('🔓 Login successful');
    setStep('main');
  };

  const handleRestore = (data) => {
    console.log('🔄 Restore data:', data);
    setStep('main');
  };

  const handleWalletLogin = (walletData) => {
    console.log('💰 Wallet login:', walletData);
    setStep('wallet');
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setStep('nickname');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {step === 'main' ? (
        <MainApp
          nickname={nickname}
          publicKey={masterKeyData?.wallet?.publicKey}
          lang={lang}
          onLogout={handleLogout}
          isNewSession={step === 'main' && masterKeyData !== null}
        />
      ) : (
        <div className="flex items-center justify-center p-4 min-h-screen bg-[var(--bg-primary)]">
          <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-6 w-full max-w-md">

            {/* ===== ENTRY SCREEN ===== */}
            {!entryMode && step !== 'login' && (
              <OnboardingLayoutES lang={lang} onToggleLang={toggleLang}>
                <EntryScreen onSelect={handleEntrySelect} lang={lang} hasSession={hasSession} />
              </OnboardingLayoutES>
            )}

            {/* ===== PIN / BIOMETRIC LOGIN ===== */}
            {step === 'login' && (
              <OnboardingLayout lang={lang} onToggleLang={toggleLang} onBack={handleBack}>
                <LoginScreen
                  onLogin={handleLogin}
                  lang={lang}
                  isBiometricAvailable={isBiometricAvailable}
                />
              </OnboardingLayout>
            )}

            {/* ===== RESTORE ON NEW DEVICE ===== */}
            {step === 'restore' && (
              <OnboardingLayout lang={lang} onToggleLang={toggleLang} onBack={handleBack}>
                <RestoreScreen onRestore={handleRestore} lang={lang} />
              </OnboardingLayout>
            )}

            {/* ===== WALLET LOGIN ===== */}
            {step === 'walletLogin' && (
              <OnboardingLayout lang={lang} onToggleLang={toggleLang} onBack={handleBack}>
                <WalletLoginScreen onLogin={handleWalletLogin} lang={lang} />
              </OnboardingLayout>
            )}

            {/* ===== CREATE ACCOUNT — NICKNAME ===== */}
            {entryMode === 'create' && step === 'nickname' && (
              <OnboardingLayout lang={lang} onToggleLang={toggleLang} onBack={handleBack}>
                <NicknameScreen
                  nickname={nickname}
                  setNickname={setNickname}
                  status={status}
                  isLoading={isLoading}
                  isConnected={isConnected}
                  checkNickname={checkNickname}
                  lang={lang}
                />
              </OnboardingLayout>
            )}

            {/* ===== MASTER KEY ===== */}
            {step === 'masterKey' && masterKeyData && (
              <MasterKeyScreen
                masterKeyData={masterKeyData}
                onNext={handleMasterKeyGenerated}
                lang={lang}
                onToggleLang={toggleLang}
              />
            )}

            {/* ===== QUIZ ===== */}
            {step === 'quiz' && masterKeyData && (
              <QuizScreen
                key="quiz-screen"
                masterKeyData={masterKeyData}
                onNext={handleQuizSuccess}
                lang={lang}
                onToggleLang={toggleLang}
              />
            )}

            {/* ===== PIN SETUP ===== */}
            {step === 'pin' && (
              <PinScreen
                onNext={handlePinConfirmed}
                lang={lang}
                onToggleLang={toggleLang}
              />
            )}

            {/* ===== FINALIZATION ===== */}
            {step === 'final' && (
              <div className="text-center space-y-4">
                <h1 className="text-7xl font-bold text-center text-gray-800 font-['Dubtronic'] font-light">
                  Ekso
                </h1>
                <h2 className="text-2xl font-bold text-gray-800 mt-6">🎉 Registration complete!</h2>
                <p className="text-gray-600">Your account has been created and secured.</p>
                <p className="text-sm text-gray-500">Chat and wallet interface coming soon.</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
