/**
 * URL Query Parameter Utilities
 * Helpers for getting/setting URL search params without page reload
 */

export function getQueryParam(param: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(param);
}

export function getQueryParamArray(param: string): string[] {
  if (typeof window === 'undefined') return [];
  const value = new URLSearchParams(window.location.search).get(param);
  return value ? value.split(',').map(v => v.trim()) : [];
}

export function setQueryParam(param: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (value === null) {
    url.searchParams.delete(param);
  } else {
    url.searchParams.set(param, value);
  }
  window.history.replaceState({}, '', url.toString());
}

export function setQueryParamArray(param: string, values: string[]): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (values.length === 0) {
    url.searchParams.delete(param);
  } else {
    url.searchParams.set(param, values.join(','));
  }
  window.history.replaceState({}, '', url.toString());
}
