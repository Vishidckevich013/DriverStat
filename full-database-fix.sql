-- ПОЛНАЯ ДИАГНОСТИКА И ИСПРАВЛЕНИЕ БАЗЫ ДАННЫХ
-- Выполните этот скрипт по частям, проверяя результаты каждого шага

-- ===============================================
-- ШАГ 1: ДИАГНОСТИКА ТЕКУЩЕГО СОСТОЯНИЯ
-- ===============================================

-- Проверяем существование таблицы settings
SELECT 
    schemaname, 
    tablename, 
    tableowner, 
    tablespace 
FROM pg_tables 
WHERE tablename = 'settings' AND schemaname = 'public';

-- Проверяем структуру существующей таблицы settings
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Проверяем политики RLS для settings
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'settings';

-- ===============================================
-- ШАГ 2: ОЧИСТКА И ПЕРЕСОЗДАНИЕ
-- ===============================================

-- Отключаем RLS временно
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;

-- Удаляем все политики
DROP POLICY IF EXISTS "Users can read own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON public.settings;

-- Удаляем индексы
DROP INDEX IF EXISTS idx_settings_user_id;

-- Полностью удаляем таблицу
DROP TABLE IF EXISTS public.settings CASCADE;

-- Ждем немного (для очистки кэша)
SELECT pg_sleep(1);

-- ===============================================
-- ШАГ 3: СОЗДАНИЕ НОВОЙ ТАБЛИЦЫ
-- ===============================================

-- Создаем таблицу settings с правильной структурой
CREATE TABLE public.settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    "orderPrice" REAL DEFAULT 100,
    "fuelPrice" REAL DEFAULT 60,
    "fuelRate" REAL DEFAULT 10,
    "minSalaryEnabled" BOOLEAN DEFAULT false,
    "minSalaryDay" REAL DEFAULT 65,
    "minSalaryEvening" REAL DEFAULT 35,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT settings_user_id_unique UNIQUE (user_id),
    CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ===============================================
-- ШАГ 4: НАСТРОЙКА БЕЗОПАСНОСТИ
-- ===============================================

-- Включаем RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS
CREATE POLICY "settings_select_policy" ON public.settings
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "settings_insert_policy" ON public.settings
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_update_policy" ON public.settings
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_delete_policy" ON public.settings
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- ===============================================
-- ШАГ 5: ОПТИМИЗАЦИЯ
-- ===============================================

-- Создаем индекс
CREATE INDEX idx_settings_user_id ON public.settings(user_id);

-- ===============================================
-- ШАГ 6: ФИНАЛЬНАЯ ПРОВЕРКА
-- ===============================================

-- Проверяем финальную структуру
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Проверяем политики
SELECT 
    policyname, 
    cmd, 
    permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'settings';

-- Проверяем что можем вставить тестовую запись (замените UUID на ваш)
-- INSERT INTO public.settings (user_id, "orderPrice") VALUES ('00000000-0000-0000-0000-000000000000', 150);
-- SELECT * FROM public.settings WHERE user_id = '00000000-0000-0000-0000-000000000000';
-- DELETE FROM public.settings WHERE user_id = '00000000-0000-0000-0000-000000000000';

SELECT 'Таблица settings успешно создана и настроена!' as result;
