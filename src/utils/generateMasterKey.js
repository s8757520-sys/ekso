/**
 * Файл: generateMasterKey.js
 * Дата: 2026-09-03
 * Назначение: Генерация мастер-ключа (48 цифр) и создание XRP-кошелька
 * Описание: Возвращает мастер-ключ и объект кошелька XRPL
 * Автор: Ekso Team
 */

import { Wallet } from 'xrpl';

export const generateMasterKey = () => {
  // 1. Генерируем валидный кошелёк через xrpl.js
  const wallet = Wallet.generate();

  // 2. Получаем seed в виде hex-строки
  const seedHex = wallet.seed;

  // 3. Преобразуем hex в массив байт
  const seedBytes = new Uint8Array(
    seedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );

  // 4. Преобразуем байты в 48 цифр (каждый байт → 3 цифры)
  let digits = '';
  for (let i = 0; i < seedBytes.length; i++) {
    const byteStr = seedBytes[i].toString().padStart(3, '0');
    digits += byteStr;
  }

  // 5. Обрезаем до 48 цифр и разбиваем на 8 блоков по 6 цифр
  const full = digits.slice(0, 48);
  const blocks = [];
  for (let i = 0; i < 8; i++) {
    blocks.push(full.slice(i * 6, i * 6 + 6));
  }

  return {
    full: full,
    blocks: blocks,
    formatted: blocks.join(' '),
    wallet: {
      address: wallet.classicAddress,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
    }
  };
};