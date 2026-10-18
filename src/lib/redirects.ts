// Only same-site relative paths are accepted as post-login destinations
export function safeRedirect(value: unknown, fallback = '/account'): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}
