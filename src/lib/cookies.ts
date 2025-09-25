import { cookies as nextCookies } from 'next/headers'

const TTL = Number(process.env.SESSION_TTL_MINUTES || 20)
const isProd = process.env.NODE_ENV === 'production'

function enc(val: unknown) {
  return Buffer.from(JSON.stringify(val)).toString('base64url')
}
function dec<T = any>(token: string): T {
  return JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as T
}

/** Build cookie (to set on a NextResponse in route handlers) */
export function buildBoardSessionCookie(shortId: string) {
  const exp = Date.now() + TTL * 60_000
  const value = enc({ shortId, exp })
  return {
    name: `wv:${shortId}`,
    value,
    options: {
      httpOnly: true,
      secure: isProd,         // allow over HTTP in dev/LAN
      sameSite: 'lax' as const,
      path: '/',
      maxAge: TTL * 60,
    },
  }
}

/** OK to use in Server Actions/components (not in route handlers) */
export function setBoardSession(shortId: string) {
  const c = buildBoardSessionCookie(shortId)
  nextCookies().set(c.name, c.value, c.options)
}

export function getBoardSession(shortId: string) {
  const raw = nextCookies().get(`wv:${shortId}`)?.value
  if (!raw) return null
  try {
    const { shortId: s, exp } = dec<{ shortId: string; exp: number }>(raw)
    if (s !== shortId || Date.now() > exp) return null
    return { shortId: s }
  } catch {
    return null
  }
}

export function clearBoardSession(shortId: string) {
  nextCookies().delete(`wv:${shortId}`)
}

/** Admin cookie helpers (mirrors board logic) */
export function buildAdminSessionCookie(email: string) {
  const value = enc({ email })
  return {
    name: 'wv_admin',
    value,
    options: {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 8,
    },
  }
}

export function buildSiteSessionCookie(siteShortId: string) {
  const TTL = Number(process.env.SESSION_TTL_MINUTES || 20)
  const isProd = process.env.NODE_ENV === 'production'
  const token = Buffer.from(JSON.stringify({ siteShortId, exp: Date.now() + TTL*60_000 })).toString('base64url')
  return {
    name: `wvsite:${siteShortId}`,
    value: token,
    options: { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/', maxAge: TTL * 60 }
  }
}
export function getSiteSession(siteShortId: string) {
  const raw = nextCookies().get(`wvsite:${siteShortId}`)?.value
  if (!raw) return null
  try {
    const { siteShortId: s, exp } = dec<{ siteShortId: string; exp: number }>(raw)
    return s === siteShortId && Date.now() < exp ? { siteShortId: s } : null
  } catch { return null }
}

export function setAdminSession(email: string) {
  const c = buildAdminSessionCookie(email)
  nextCookies().set(c.name, c.value, c.options)
}

export function getAdminSession() {
  return nextCookies().get('wv_admin')?.value || null
}

export function clearAdminSession() {
  nextCookies().delete('wv_admin')
}
