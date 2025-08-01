# АВТОМАТИЧЕСКИЙ ДЕПЛОЙ В NETLIFY

## Настройка автоматического деплоя тестовой ветки:

### Вариант 1: Через Netlify Dashboard (рекомендуется)
1. Зайдите в https://app.netlify.com
2. Найдите ваш сайт DriverStat
3. Перейдите в **Site settings** → **Build & deploy**
4. В разделе **Deploy contexts** добавьте:
   - **Branch deploys**: `test-branch`
   - **Deploy previews**: `Any pull request`

### Вариант 2: Создать отдельный тестовый сайт
1. В Netlify нажмите **New site from Git**
2. Выберите ваш репозиторий DriverStat
3. В настройках укажите:
   - **Branch to deploy**: `test-branch`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

## После настройки:
- Netlify автоматически деплоит при каждом push в test-branch
- Ссылка на тестовый сайт будет вида: `test-branch--your-site-name.netlify.app`

## Следующий шаг:
Выполните SQL-скрипт в Supabase (см. файл SUPABASE_SETUP_GUIDE.md)
