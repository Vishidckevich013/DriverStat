# АВТОМАТИЧЕСКИЙ ДЕПЛОЙ В NETLIFY

## Настройка автоматического деплоя тестовой ветки:

### Вариант 1: Через Netlify Dashboard (рекомендуется)
1. Зайдите в https://app.netlify.com
2. Найдите ваш сайт DriverStat
3. Перейдите в **Site settings** → **Build & deploy**
4. В разделе **Deploy contexts** добавьте:
   - **Branch deploys**: `mobile-responsive-test`
   - **Deploy previews**: `Any pull request`

### Вариант 2: Создать отдельный тестовый сайт
1. В Netlify нажмите **New site from Git**
2. Выберите ваш репозиторий DriverStat
3. В настройках укажите:
   - **Branch to deploy**: `mobile-responsive-test`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

## После настройки:
- Netlify автоматически деплоит при каждом push в mobile-responsive-test
- Ссылка на тестовый сайт будет вида: `mobile-responsive-test--your-site-name.netlify.app`

## Текущая ветка для тестирования:
**mobile-responsive-test** - содержит полную адаптивную верстку для мобильных устройств

## Следующий шаг:
Выполните SQL-скрипт в Supabase (см. файл SUPABASE_SETUP_GUIDE.md)
