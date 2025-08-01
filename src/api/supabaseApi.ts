import { supabase } from '../supabaseClient';

// Типы для пользователя
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

// Авторизация
export async function signUp(email: string, password: string, name: string): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  });
  
  if (error) throw error;
  if (!data.user) throw new Error('Ошибка создания пользователя');
  
  return {
    id: data.user.id,
    email: data.user.email!,
    name: name,
    created_at: data.user.created_at!
  };
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  if (!data.user) throw new Error('Ошибка авторизации');
  
  return {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name || 'Пользователь',
    created_at: data.user.created_at!
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || 'Пользователь',
    created_at: user.created_at!
  };
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
