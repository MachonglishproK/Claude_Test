export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export function getLastNWeeks(n: number, from: Date = new Date()): string[] {
  const weeks: string[] = [];
  const current = new Date(from);

  for (let i = 0; i < n; i++) {
    weeks.unshift(getWeekStart(current));
    current.setDate(current.getDate() - 7);
  }

  return weeks;
}

export function formatDate(dateStr: string, locale: 'ja' | 'en' = 'ja'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatWeekRange(weekStart: string, locale: 'ja' | 'en' = 'ja'): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startStr = formatDate(weekStart, locale);
  const endStr = formatDate(end.toISOString().split('T')[0], locale);

  return `${startStr} - ${endStr}`;
}
