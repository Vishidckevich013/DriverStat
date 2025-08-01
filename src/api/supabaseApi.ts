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
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user_id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Сохранить/обновить настройки пользователя
export async function saveSettings(user_id: string, settings: any) {
  // upsert: если есть — обновит, если нет — создаст
  const { data, error } = await supabase
    .from('settings')
    .upsert([{ ...settings, user_id }], { onConflict: 'user_id' });
  if (error) throw error;
  return data;
}
