# БЫСТРОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С БАЗОЙ ДАННЫХ

## Проблема
Ошибка: `Could not find the 'fuelPrice' column of 'settings'` означает, что таблица settings имеет неправильную структуру.

## Решение

### Шаг 1: Выполните fix-settings-table.sql
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект → **SQL Editor**
3. Скопируйте и выполните содержимое файла `fix-settings-table.sql`

### Шаг 2: Проверьте результат
После выполнения скрипта вы должны увидеть в результате структуру таблицы:
```
column_name    | data_type | is_nullable | column_default
---------------|-----------|-------------|---------------
id             | bigint    | NO          | nextval(...)
user_id        | uuid      | NO          | 
orderPrice     | real      | YES         | 100
fuelPrice      | real      | YES         | 60
fuelRate       | real      | YES         | 10
...
```

### Шаг 3: Протестируйте сохранение настроек
1. Откройте приложение
2. Перейдите в Настройки
3. Попробуйте сохранить настройки
4. Проверьте консоль браузера - ошибок быть не должно

## Если проблема не решилась
Выполните полный SQL-скрипт заново: `supabase-users-table.sql`
