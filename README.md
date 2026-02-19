# Gym Tracker

> **[Live Demo](https://riskohop.github.io/Gym-tracker/)**

Mobile-first Progressive Web App для отслеживания тренировок. Полностью оффлайн — все данные хранятся локально на устройстве.

## Технологии

- **SvelteKit 2** + **TypeScript** — фреймворк и SPA с static adapter
- **Tailwind CSS v4** — стили
- **Dexie.js** — IndexedDB обёртка (полностью оффлайн)
- **Chart.js** — графики статистики
- **Zod** — валидация данных
- **Workbox** (через `@vite-pwa/sveltekit`) — service worker и кэширование

## Возможности

- Создание и управление тренировками
- Библиотека упражнений (21 предустановленное)
- Трекинг подходов: вес, повторения, заметки
- Дашборд с ключевыми метриками
- Статистика по упражнениям с графиками
- Расчёт 1RM по формуле Эпли
- Личные рекорды
- Swipe-to-delete жесты
- Pull-to-refresh
- Экспорт CSV / JSON backup
- Переключение кг ↔ фунты
- Локализация RU / EN
- Тёмная / светлая тема
- PWA: установка на домашний экран, оффлайн-режим, splash screen
- Haptic feedback
- Safe area support (iPhone notch)

## Структура проекта

```
src/
├── lib/
│   ├── components/     # UI-компоненты
│   ├── db/             # Dexie.js база данных
│   ├── domain/         # Типы и Zod-схемы
│   ├── services/       # Бизнес-логика, статистика
│   ├── stores/         # Svelte stores (настройки, состояние)
│   └── utils/          # Утилиты (i18n, расчёты)
├── routes/
│   ├── dashboard/      # Главный экран
│   ├── workouts/       # Список + детали тренировки
│   ├── exercises/      # Управление упражнениями
│   ├── statistics/     # Графики и аналитика
│   ├── settings/       # Настройки приложения
│   └── privacy/        # Политика конфиденциальности
└── app.html
```

## Локальная разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Деплой

Проект автоматически деплоится на GitHub Pages при пуше в `main` через GitHub Actions.

## Приватность

Все данные хранятся исключительно локально на устройстве. Нет серверов, API, аналитики или cookies.
