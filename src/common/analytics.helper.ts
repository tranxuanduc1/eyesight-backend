export type Interval = 'day' | 'week' | 'month';

export interface AnalyticsRow {
  bucket: Date;
  count: bigint;
}

export interface AnalyticsResponse {
  labels: string[];
  data: number[];
  total: number;
}

function formatLabel(date: Date, interval: Interval): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');

  if (interval === 'month') return `${y}-${m}`;
  return `${y}-${m}-${d}`;
}

function nextBucket(date: Date, interval: Interval): Date {
  const next = new Date(date);
  if (interval === 'day') next.setUTCDate(next.getUTCDate() + 1);
  else if (interval === 'week') next.setUTCDate(next.getUTCDate() + 7);
  else next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

function truncateToBucket(date: Date, interval: Interval): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (interval === 'month') return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  if (interval === 'week') {
    const day = d.getUTCDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day; // align to Monday
    d.setUTCDate(d.getUTCDate() + diff);
    return d;
  }
  return d;
}

export function buildAnalyticsResponse(
  rows: AnalyticsRow[],
  start: Date,
  end: Date,
  interval: Interval,
): AnalyticsResponse {
  const countMap = new Map<string, number>();
  for (const row of rows) {
    const label = formatLabel(new Date(row.bucket), interval);
    countMap.set(label, Number(row.count));
  }

  const labels: string[] = [];
  const data: number[] = [];

  let cursor = truncateToBucket(start, interval);
  const endTrunc = truncateToBucket(end, interval);

  while (cursor <= endTrunc) {
    const label = formatLabel(cursor, interval);
    labels.push(label);
    data.push(countMap.get(label) ?? 0);
    cursor = nextBucket(cursor, interval);
  }

  const total = data.reduce((sum, v) => sum + v, 0);
  return { labels, data, total };
}
