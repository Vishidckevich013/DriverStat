// Утилиты для работы с аватарками

/**
 * Генерирует SVG аватарку с первой буквой имени на фиолетовом фоне
 */
export function generateDefaultAvatar(name: string, size: number = 128): string {
  const firstLetter = name.charAt(0).toUpperCase() || 'U';
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#6c4aff"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${size * 0.4}" 
        font-weight="600" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="central"
      >
        ${firstLetter}
      </text>
    </svg>
  `;
  
  // Конвертируем SVG в data URL
  const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
  return dataUrl;
}

/**
 * Проверяет, является ли URL аватарки сгенерированной по умолчанию
 */
export function isDefaultAvatar(avatarUrl?: string): boolean {
  return !avatarUrl || avatarUrl.startsWith('data:image/svg+xml');
}

/**
 * Получает аватарку пользователя или генерирует дефолтную
 */
export function getUserAvatar(user: { name?: string; avatar?: string }, size: number = 128): string {
  if (user.avatar && !isDefaultAvatar(user.avatar)) {
    return user.avatar;
  }
  
  return generateDefaultAvatar(user.name || 'User', size);
}
