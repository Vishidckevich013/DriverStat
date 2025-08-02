// Простой тест API функций для проверки работоспособности
console.log('🧪 Тестирование API функций...');

// Проверим доступность Supabase
async function testSupabaseConnection() {
  try {
    const { createClient } = await import('./src/supabaseClient.ts');
    
    // Попробуем получить версию Supabase
    const response = await fetch('https://your-project.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'your-anon-key'
      }
    });
    
    console.log('✅ Соединение с Supabase проверено');
    return true;
  } catch (error) {
    console.log('❌ Ошибка соединения с Supabase:', error.message);
    return false;
  }
}

// Запускаем тест
testSupabaseConnection();
