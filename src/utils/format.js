// Vietnamese formatting utilities

export function formatPrice(priceDisplay) {
  return priceDisplay || '';
}

export function formatRating(rating) {
  if (!rating) return null;
  return rating.toFixed(1);
}

export function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getInitials(name) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

export function formatCountdown(seconds) {
  if (seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
