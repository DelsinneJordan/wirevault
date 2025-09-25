import { cookies as nextCookies } from 'next/headers'
const TTL = Number(process.env.SESSION_TTL_MINUTES || 20)
const isProd = process.env.NODE_ENV === 'production'
const enc = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url')
const dec = <T=any>(t: string) => JSON.parse(Buffer.from(t, 'base64url').toString('utf8')) as T

export function buildSiteSessionCookie(siteShortId: string) {
  const value = enc({ siteShortId, exp: Date.now() + TTL*60_000 })
  return { name: `wvsite:${siteShortId}`, value,
    options: { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/', maxAge: TTL*60 } }
}
export function getSiteSession(siteShortId: string) {
  const raw = nextCookies().get(`wvsite:${siteShortId}`)?.value
  if (!raw) return null
  try {
    const { siteShortId: s, exp } = dec<{ siteShortId:string; exp:number }>(raw)
    return (s===siteShortId && Date.now() < exp) ? { siteShortId: s } : null
  } catch { return null }
}
