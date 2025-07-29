
# Telegram Web App (Mini App) на Vite + React + TypeScript

## Описание

Это шаблон фронтенд-приложения для запуска внутри Telegram-бота (WebApp). Используется Vite, React и TypeScript. Включена интеграция с Telegram WebApp API: получение информации о пользователе и отправка данных боту.

## Быстрый старт

1. Установите зависимости:
   ```
npm install
   ```
2. Запустите приложение:
   ```
npm run dev
   ```
3. Разместите билд (`dist/`) на хостинге и укажите URL в настройках Telegram-бота.

## Пример использования Telegram WebApp API
- Получение user info: `window.Telegram.WebApp.initDataUnsafe.user`
- Отправка данных боту: `window.Telegram.WebApp.sendData()`

## Важно
- Для корректной работы user info приложение должно быть открыто внутри Telegram.
- Подробнее: https://core.telegram.org/bots/webapps
