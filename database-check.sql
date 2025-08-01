-- Быстрая проверка состояния базы данных
-- Выполните эти запросы в Supabase SQL Editor для диагностики

-- 1. Проверка существования таблицы settings
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'settings'
) as settings_table_exists;

-- 2. Проверка структуры таблицы settings (если существует)
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Проверка политик RLS
SELECT 
    policyname, 
    cmd as command_type,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'settings';

-- 4. Проверка данных (если таблица существует)
SELECT COUNT(*) as total_settings FROM public.settings;

-- 5. Проверка таблицы users
SELECT 
    id,
    email,
    username,
    created_at
FROM public.users 
LIMIT 3;

-- Если вы видите ошибки выше, выполните скрипт full-database-fix.sql
