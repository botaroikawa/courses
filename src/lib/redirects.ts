// Only same-site relative paths are accepted as post-login destinations
export function safeRedirect(value: unknown, fallback = '/account'): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

// The proxy passes the full localized path; navigation helpers expect it without the prefix
export function stripLocale(path: string, locale: string) {
  return path === `/${locale}` ? '/' : path.replace(new RegExp(`^/${locale}(?=/)`), '')
}
