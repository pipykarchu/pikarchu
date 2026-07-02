const BASE_URL = import.meta.env.BASE_URL || '/'

export const withBase = (path = '') => {
  const value = String(path || '')
  if (!value) return ''
  if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value
  const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`
  return `${base}${value.replace(/^\/+/, '')}`
}

export const withVersion = (path = '', version = '0.1.0') => {
  const url = withBase(path)
  if (!url || /^(https?:|mailto:|tel:|#)/i.test(url)) return url
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`
}
