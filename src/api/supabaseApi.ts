import { supabase } from '../supabaseClient';

// Типы для пользователя
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  created_at: string;
}

// Авторизация
export async function signUp(email: string, password: string, name: string, username: string): Promise<User> {
  // Проверяем, не занят ли логин
  const { data: existingUser, error: searchError } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();
    
  if (searchError && searchError.code !== 'PGRST116') {
    console.error('Ошибка проверки логина:', searchError);
  }
    
  if (existingUser) {
    throw new Error('Логин уже занят');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        username: username
      }
    }
  });
  
  if (error) throw error;
  if (!data.user) throw new Error('Ошибка создания пользователя');
  
  // Пытаемся сохранить пользователя в таблицу users (если триггер не сработал)
  const { error: insertError } = await supabase
    .from('users')
    .insert([{
      id: data.user.id,
      email: data.user.email,
      name: name,
      username: username
    }]);
    
  // Игнорируем ошибку дублирования (если триггер уже создал запись)
  if (insertError && !insertError.message.includes('duplicate key')) {
    console.error('Ошибка сохранения пользователя:', insertError);
  }
  
  return {
    id: data.user.id,
    email: data.user.email!,
    name: name,
    username: username,
    created_at: data.user.created_at!
  };
}

export async function signIn(loginOrEmail: string, password: string, rememberMe: boolean = false): Promise<User> {
  let email = loginOrEmail;
  
  // Если это не email, ищем email по логину
  if (!loginOrEmail.includes('@')) {
    const { data: userData, error: searchError } = await supabase
      .from('users')
      .select('email')
      .eq('username', loginOrEmail)
      .single();
      
    if (searchError || !userData) {
      throw new Error('Пользователь с таким логином не найден');
    }
    email = userData.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Ошибка авторизации:', error);
    throw new Error('Неверный логин/email или пароль');
  }
  if (!data.user) throw new Error('Ошибка авторизации');
  
  // Если "Запомнить меня", сохраняем в localStorage
  if (rememberMe) {
    localStorage.setItem('rememberMe', 'true');
  } else {
    localStorage.removeItem('rememberMe');
  }
  
  // Получаем данные пользователя из таблицы users
  const { data: userInfo, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  if (userError) {
    console.error('Ошибка получения данных пользователя:', userError);
    // Fallback: используем данные из auth.users
    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || 'Пользователь',
      username: data.user.user_metadata?.username || '',
      created_at: data.user.created_at!
    };
  }
  
  return {
    id: data.user.id,
    email: data.user.email!,
    name: userInfo.name || data.user.user_metadata?.name || 'Пользователь',
    username: userInfo.username || data.user.user_metadata?.username || '',
    created_at: data.user.created_at!
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  localStorage.removeItem('rememberMe');
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Ошибка получения текущего пользователя:', error);
      return null;
    }
    
    if (!user) return null;
    
    // Получаем данные пользователя из таблицы users
    const { data: userInfo, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) {
      console.error('Ошибка получения данных пользователя из таблицы users:', userError);
      // Fallback: используем данные из auth.users
      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || 'Пользователь',
        username: user.user_metadata?.username || '',
        created_at: user.created_at!
      };
    }
    
    return {
      id: user.id,
      email: user.email!,
      name: userInfo.name || user.user_metadata?.name || 'Пользователь',
      username: userInfo.username || user.user_metadata?.username || '',
      created_at: user.created_at!
    };
  } catch (error) {
    console.error('Ошибка в getCurrentUser:', error);
    return null;
  }
}

export function isRemembered(): boolean {
  return localStorage.getItem('rememberMe') === 'true';
}

// Диагностика состояния базы данных
export async function checkDatabaseTables() {
  console.log('Проверяем состояние таблиц в базе данных...');
  
  const tables = ['users', 'shifts', 'settings'];
  const results: Record<string, any> = {};
  
  for (const table of tables) {
    try {
      // Проверяем существование таблицы
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        results[table] = { status: 'error', error: error.message, code: error.code };
        
        // Если таблица settings - проверяем её структуру отдельно
        if (table === 'settings') {
          try {
            const { data: structure, error: structError } = await supabase.rpc('check_settings_structure');
            if (structError) {
              results[table].structureError = structError.message;
            } else {
              results[table].structure = structure;
            }
          } catch (e) {
            results[table].structureCheck = 'failed';
          }
        }
      } else {
        results[table] = { status: 'ok', count: data?.length || 0 };
        
        // Для settings проверяем наличие нужных колонок
        if (table === 'settings' && data && data.length > 0) {
          const firstRow = data[0];
          const requiredColumns = ['orderPrice', 'fuelPrice', 'fuelRate', 'minSalaryEnabled', 'minSalaryDay', 'minSalaryEvening'];
          const missingColumns = requiredColumns.filter(col => !(col in firstRow));
          if (missingColumns.length > 0) {
            results[table].missingColumns = missingColumns;
            results[table].status = 'incomplete';
          }
        }
      }
    } catch (e) {
      results[table] = { status: 'exception', error: (e as Error).message };
    }
  }
  
  console.log('Результаты проверки таблиц:', results);
  
  // Дополнительная проверка для settings
  if (results.settings?.status === 'error' || results.settings?.status === 'incomplete') {
    console.log('Выполняем дополнительную диагностику таблицы settings...');
    try {
      const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'settings')
        .eq('table_schema', 'public');
        
      if (colError) {
        console.log('Не удалось получить структуру таблицы settings:', colError.message);
      } else {
        console.log('Текущая структура таблицы settings:', columns);
        results.settings.currentColumns = columns;
      }
    } catch (e) {
      console.log('Ошибка при проверке структуры:', (e as Error).message);
    }
  }
  
  return results;
}

// Принудительное обновление схемы Supabase
export async function refreshSupabaseSchema() {
  console.log('Попытка обновления схемы Supabase...');
  try {
    // Создаем новое подключение к Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Отсутствуют переменные окружения Supabase');
    }
    
    // Создаем временный клиент для проверки
    const tempClient = createClient(supabaseUrl, supabaseKey);
    
    // Пробуем простой запрос для обновления схемы
    const { error } = await tempClient
      .from('settings')
      .select('id')
      .limit(1);
      
    if (error) {
      console.log('Схема все еще содержит ошибки:', error.message);
      return { success: false, error: error.message };
    } else {
      console.log('Схема успешно обновлена');
      return { success: true };
    }
  } catch (e) {
    console.error('Ошибка при обновлении схемы:', e);
    return { success: false, error: (e as Error).message };
  }
}

// Получить все смены пользователя
export async function getShifts(user_id: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', user_id)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

// Добавить смену
export async function addShift(user_id: string, shift: Omit<any, 'id' | 'user_id'>) {
  console.log('API addShift: Добавляем смену для пользователя:', user_id);
  console.log('API addShift: Данные смены:', shift);
  
  const { data, error } = await supabase
    .from('shifts')
    .insert([{ ...shift, user_id }]);
    
  if (error) {
    console.error('API addShift: Ошибка при добавлении смены:', error);
    throw error;
  }
  
  console.log('API addShift: Смена успешно добавлена:', data);
  return data;
}

// Удалить одну смену
export async function deleteShift(user_id: string, shift_id: number) {
  console.log('API deleteShift: Удаляем смену:', shift_id, 'для пользователя:', user_id);
  
  const { error } = await supabase
    .from('shifts')
    .delete()
    .eq('id', shift_id)
    .eq('user_id', user_id);
    
  if (error) {
    console.error('API deleteShift: Ошибка при удалении смены:', error);
    throw error;
  }
  
  console.log('API deleteShift: Смена успешно удалена');
}

// Обновить смену
export async function updateShift(user_id: string, shift_id: number, shift: Partial<any>) {
  console.log('API updateShift: Обновляем смену:', shift_id, 'для пользователя:', user_id);
  console.log('API updateShift: Новые данные:', shift);
  
  const { data, error } = await supabase
    .from('shifts')
    .update(shift)
    .eq('id', shift_id)
    .eq('user_id', user_id);
    
  if (error) {
    console.error('API updateShift: Ошибка при обновлении смены:', error);
    throw error;
  }
  
  console.log('API updateShift: Смена успешно обновлена:', data);
  return data;
}

// Очистить все смены пользователя
export async function clearShifts(user_id: string) {
  const { error } = await supabase
    .from('shifts')
    .delete()
    .eq('user_id', user_id);
  if (error) throw error;
}

// Получить настройки пользователя
export async function getSettings(user_id: string) {
  console.log('API getSettings: Получаем настройки для пользователя:', user_id);
  
  // Сначала проверим, что таблица settings существует
  const { error: tableError } = await supabase
    .from('settings')
    .select('count')
    .limit(1);
    
  if (tableError) {
    console.error('API getSettings: Ошибка доступа к таблице settings:', tableError);
    if (tableError.code === '42P01') {
      throw new Error('Таблица settings не существует. Выполните SQL-скрипт в Supabase SQL Editor');
    }
  }
  
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user_id)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('API getSettings: Ошибка при получении настроек:', error);
    console.error('JSON ошибки:', JSON.stringify(error, null, 2));
    throw error;
  }
  
  console.log('API getSettings: Полученные настройки:', data);
  return data;
}

// Отправка обратной связи в Telegram
export async function sendFeedbackToTelegram(type: string, message: string, userInfo?: { name?: string; email?: string }) {
  const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram Bot не настроен. Добавьте VITE_TELEGRAM_BOT_TOKEN и VITE_TELEGRAM_CHAT_ID в .env файл');
    return false;
  }
  
  const typeEmoji = type === 'complaint' ? '⚠️' : '💡';
  const typeText = type === 'complaint' ? 'Жалоба' : 'Предложение';
  
  const telegramMessage = `
${typeEmoji} <b>Новая обратная связь - ${typeText}</b>

📝 <b>Сообщение:</b>
${message}

👤 <b>От пользователя:</b>
${userInfo?.name || 'Неизвестный пользователь'}
${userInfo?.email ? `📧 ${userInfo.email}` : ''}

🕐 <b>Время:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
  `.trim();
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'HTML',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка отправки в Telegram:', errorData);
      return false;
    }
    
    console.log('Сообщение успешно отправлено в Telegram');
    return true;
  } catch (error) {
    console.error('Ошибка при отправке в Telegram:', error);
    return false;
  }
}

// Сохранить/обновить настройки пользователя
export async function saveSettings(user_id: string, settings: any) {
  console.log('API saveSettings: Сохраняем настройки для пользователя:', user_id);
  console.log('API saveSettings: Данные настроек:', settings);
  
  // upsert: если есть — обновит, если нет — создаст
  const { data, error } = await supabase
    .from('settings')
    .upsert([{ ...settings, user_id }], { onConflict: 'user_id' });
    
  if (error) {
    console.error('API saveSettings: Ошибка при сохранении настроек:');
    console.error('Тип ошибки:', typeof error);
    console.error('Ошибка полностью:', error);
    console.error('JSON ошибки:', JSON.stringify(error, null, 2));
    
    if (error.message) console.error('Message:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    
    // Более понятные ошибки для пользователя
    if (error.code === 'PGRST204' && error.message && error.message.includes('column')) {
      throw new Error('Структура базы данных устарела. Выполните скрипт fix-settings-table.sql в Supabase SQL Editor');
    } else if (error.code === '42P01') {
      throw new Error('Таблица settings не существует. Выполните полный SQL-скрипт в Supabase SQL Editor');
    }
    
    throw new Error(`Ошибка сохранения настроек: ${error.message || JSON.stringify(error)}`);
  }
  
  console.log('API saveSettings: Настройки успешно сохранены:', data);
  return data;
}
