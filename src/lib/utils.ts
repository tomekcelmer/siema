export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} zł`;
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('pl-PL');
}

export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('pl-PL');
}

export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('pl-PL');
}

export function validatePrice(priceStr: string): { valid: boolean; error?: string; value?: number } {
  const price = parseFloat(priceStr);

  if (isNaN(price)) {
    return { valid: false, error: 'Cena musi być liczbą' };
  }

  if (price <= 0) {
    return { valid: false, error: 'Cena musi być dodatnia' };
  }

  const decimals = (priceStr.split('.')[1] || '').length;
  if (decimals > 2) {
    return { valid: false, error: 'Maksymalnie 2 miejsca po przecinku' };
  }

  return { valid: true, value: price };
}

export function calculateTimeRemaining(endTime: string): { minutes: number; seconds: number; total: number } {
  const end = new Date(endTime).getTime();
  const now = new Date().getTime();
  const remaining = Math.max(0, Math.floor((end - now) / 1000));

  return {
    minutes: Math.floor(remaining / 60),
    seconds: remaining % 60,
    total: remaining
  };
}
