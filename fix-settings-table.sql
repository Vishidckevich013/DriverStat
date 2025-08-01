-- ИСПРАВЛЕНИЕ ТАБЛИЦЫ SETTINGS
-- Выполните этот скрипт если у вас ошибка "Could not find the 'fuelPrice' column"

-- Сначала удаляем таблицу settings если она существует с неправильной структурой
DROP TABLE IF EXISTS public.settings CASCADE;

-- Создаем таблицу settings заново с правильной структурой
CREATE TABLE public.settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    orderPrice REAL DEFAULT 100,
    fuelPrice REAL DEFAULT 60,
    fuelRate REAL DEFAULT 10,
    minSalaryEnabled BOOLEAN DEFAULT false,
    minSalaryDay REAL DEFAULT 65,
    minSalaryEvening REAL DEFAULT 35,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS для таблицы settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если они есть
DROP POLICY IF EXISTS "Users can read own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;

-- Создаем политики для таблицы settings
CREATE POLICY "Users can read own settings" ON public.settings
    FOR SELECT USING ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can insert own settings" ON public.settings
    FOR INSERT WITH CHECK ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can update own settings" ON public.settings
    FOR UPDATE USING ((auth.uid())::text = (user_id)::text);

-- Создаем индекс для оптимизации
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);

-- Проверяем структуру таблицы
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'settings' AND table_schema = 'public'
ORDER BY ordinal_position;
