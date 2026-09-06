/**
 * Файл: debug.js
 * Дата: 2026-09-04
 * Назначение: Отладка переключения языка и сброса мастер-ключа
 * Описание: Логирует каждый вызов setStep, setMasterKeyData, toggleLang
 * Автор: Ekso Team
 */

let stepLog = [];
let masterKeyLog = [];

export const logStep = (step, caller) => {
  stepLog.push({ step, caller, time: new Date().toISOString() });
  console.log(`📌 [${caller}] setStep -> "${step}"`);
  console.log('📋 История шагов:', stepLog);
};

export const logMasterKey = (action, data) => {
  masterKeyLog.push({ action, data, time: new Date().toISOString() });
  console.log(`🔑 [${action}] masterKeyData:`, data);
  console.log('📋 История мастер-ключа:', masterKeyLog);
};

export const clearLogs = () => {
  stepLog = [];
  masterKeyLog = [];
  console.log('🧹 Логи очищены');
};