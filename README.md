### Hexlet tests and linter status:
[![Actions Status](https://github.com/ilyaRozhkov/test-program-please-ignore-2-project-426/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/ilyaRozhkov/test-program-please-ignore-2-project-426/actions)


Приложение развёрнуто на Render: https://test-program-please-ignore-2-project-426.onrender.com/ 

Локальный запуск:

1. Скопируйте `.env.example` в `.env` и заполните переменные.
2. Запустите базу: `docker compose up -d`
3. Установите зависимости: `npm run install:all`
4. Примените миграции: `cd backend && npx prisma migrate dev`
5. Запустите в режиме разработки: `npm run dev`
