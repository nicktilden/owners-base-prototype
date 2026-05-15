export type ReleaseTimeframe = 'now' | 'next' | 'future';
export type ReleaseFilter = ReleaseTimeframe | 'all';

export const RELEASE_TIMEFRAMES: ReleaseTimeframe[] = ['now', 'next', 'future'];
export const RELEASE_FILTERS: ReleaseFilter[] = ['now', 'next', 'future', 'all'];

export const RELEASE_TIMEFRAME_LABELS: Record<ReleaseFilter, string> = {
  now: 'Now',
  next: 'Next',
  future: 'Future',
  all: 'All',
};

export function isReleaseFilter(value: unknown): value is ReleaseFilter {
  return typeof value === 'string' && (RELEASE_FILTERS as string[]).includes(value);
}
