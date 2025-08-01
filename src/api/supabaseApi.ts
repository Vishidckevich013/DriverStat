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
  const { data: existingUser } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();
    
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
  
  // Сохраняем пользователя в таблицу users для поиска по логину
  const { error: insertError } = await supabase
    .from('users')
    .insert([{
      id: data.user.id,
      email: data.user.email,
      name: name,
      username: username
    }]);
    
  if (insertError) {
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
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('username', loginOrEmail)
      .single();
      
    if (!userData) {
      throw new Error('Пользователь с таким логином не найден');
    }
    email = userData.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  if (!data.user) throw new Error('Ошибка авторизации');
  
  // Если "Запомнить меня", сохраняем в localStorage
  if (rememberMe) {
    localStorage.setItem('rememberMe', 'true');
  } else {
    localStorage.removeItem('rememberMe');
  }
  
  // Получаем данные пользователя из таблицы users
  const { data: userInfo } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  return {
    id: data.user.id,
    email: data.user.email!,
    name: userInfo?.name || data.user.user_metadata?.name || 'Пользователь',
    username: userInfo?.username || data.user.user_metadata?.username || '',
    created_at: data.user.created_at!
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  localStorage.removeItem('rememberMe');
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Получаем данные пользователя из таблицы users
  const { data: userInfo } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return {
    id: user.id,
    email: user.email!,
    name: userInfo?.name || user.user_metadata?.name || 'Пользователь',
    username: userInfo?.username || user.user_metadata?.username || '',
    created_at: user.created_at!
  };
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
  const { data, error } = await supabase
    .from('shifts')
    .insert([{ ...shift, user_id }]);
  if (error) throw error;
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
