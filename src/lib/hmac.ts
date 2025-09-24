import crypto from 'node:crypto'
const secret = process.env.SESSION_HMAC_SECRET || 'dev-secret'
export function sign(payload: object) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}
export function verify(token: string): null | any {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url')
  if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    try { return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) } catch { return null }
  }
  return null
}
