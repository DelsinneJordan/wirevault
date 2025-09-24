import { cookies } from 'next/headers'
const TTL = Number(process.env.SESSION_TTL_MINUTES || 20)
export function setBoardSession(shortId: string) {
  const exp = Date.now() + TTL * 60_000
  const token = Buffer.from(JSON.stringify({ shortId, exp })).toString('base64url')
  cookies().set(`wv:${shortId}`, token, { httpOnly: true, secure: true, path: '/', maxAge: TTL * 60 })
}
export function getBoardSession(shortId: string) {
  const raw = cookies().get(`wv:${shortId}`)?.value
  if (!raw) return null
  try {
    const { shortId: s, exp } = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
    if (s !== shortId || Date.now() > exp) return null
    return { shortId: s }
  } catch { return null }
}
export function clearBoardSession(shortId: string) {
  cookies().delete(`wv:${shortId}`)
}
export function setAdminSession(email: string) {
  cookies().set('wv_admin', email, { httpOnly: true, secure: true, path: '/', maxAge: 60 * 60 * 8 })
}
export function getAdminSession() {
  return cookies().get('wv_admin')?.value || null
}
export function clearAdminSession() {
  cookies().delete('wv_admin')
}
