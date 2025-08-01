-- Создание таблицы пользователей для поиска по логину
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если они есть
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Allow username lookup for login" ON public.users;

-- Политика: пользователи могут читать и изменять только свои данные
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING ((auth.uid())::text = (id)::text);

CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK ((auth.uid())::text = (id)::text);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING ((auth.uid())::text = (id)::text);

-- Политика для поиска email по логину (нужна для авторизации)
-- Разрешаем всем читать username и email для авторизации
CREATE POLICY "Allow username lookup for login" ON public.users
    FOR SELECT TO anon, authenticated USING (true);

-- Индекс для быстрого поиска по логину
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Удаляем старый триггер если есть
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Создание функции для автоматического создания записи в users при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Вставляем только если записи еще нет
  INSERT INTO public.users (id, email, name, username)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Пользователь'),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания записи в users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================
-- СОЗДАНИЕ ТАБЛИЦ SHIFTS И SETTINGS
-- ==============================================

-- Создание таблицы смен
CREATE TABLE IF NOT EXISTS public.shifts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    orders INTEGER NOT NULL,
    distance REAL NOT NULL,
    type TEXT CHECK (type IN ('day', 'evening')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы настроек
CREATE TABLE IF NOT EXISTS public.settings (
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

-- Включаем RLS для таблиц
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики для shifts
DROP POLICY IF EXISTS "Users can read own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can insert own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can update own shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can delete own shifts" ON public.shifts;

-- Политики для таблицы shifts
CREATE POLICY "Users can read own shifts" ON public.shifts
    FOR SELECT USING ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can insert own shifts" ON public.shifts
    FOR INSERT WITH CHECK ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can update own shifts" ON public.shifts
    FOR UPDATE USING ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can delete own shifts" ON public.shifts
    FOR DELETE USING ((auth.uid())::text = (user_id)::text);

-- Удаляем старые политики для settings
DROP POLICY IF EXISTS "Users can read own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;

-- Политики для таблицы settings
CREATE POLICY "Users can read own settings" ON public.settings
    FOR SELECT USING ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can insert own settings" ON public.settings
    FOR INSERT WITH CHECK ((auth.uid())::text = (user_id)::text);

CREATE POLICY "Users can update own settings" ON public.settings
    FOR UPDATE USING ((auth.uid())::text = (user_id)::text);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON public.shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON public.shifts(date);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);
