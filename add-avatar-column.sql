-- Добавляем поле avatar в таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Добавляем комментарий к полю
COMMENT ON COLUMN users.avatar IS 'URL аватарки пользователя (base64 или URL)';
