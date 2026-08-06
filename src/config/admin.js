const ADMIN_ORIGIN = (import.meta.env.VITE_ADMIN_ORIGIN || '').replace(/\/$/, '')

export const ADMIN_PATH = '/admin'
export const ADMIN_URL = ADMIN_ORIGIN ? `${ADMIN_ORIGIN}${ADMIN_PATH}` : ADMIN_PATH

export function ensureAdminOrigin() {
  if (!ADMIN_ORIGIN || typeof window === 'undefined') return false

  const onAdminRoute = window.location.pathname === ADMIN_PATH || window.location.pathname.startsWith(`${ADMIN_PATH}/`)
  if (!onAdminRoute || window.location.origin === ADMIN_ORIGIN) return false

  window.location.replace(`${ADMIN_ORIGIN}${window.location.pathname}${window.location.search}${window.location.hash}`)
  return true
}

export function isAdminOrigin() {
  if (!ADMIN_ORIGIN || typeof window === 'undefined') return true
  return window.location.origin === ADMIN_ORIGIN
}
