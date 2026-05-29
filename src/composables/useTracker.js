const getSessionId = () => {
  const key = 'pixiyu_session_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing

  const sessionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  localStorage.setItem(key, sessionId)
  return sessionId
}

export function useTracker() {
  const isAdminRoute = window.location.pathname.startsWith('/admin')

  const track = (type, label = '') => {
    if (isAdminRoute) return

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        label,
        path: window.location.pathname + window.location.hash,
        referrer: document.referrer,
        sessionId: getSessionId()
      })
    }).catch(() => {})
  }

  return { track }
}
