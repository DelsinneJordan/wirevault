import type { NextRequest } from 'next/server'

export function getRequestOrigin(req: NextRequest) {
  // Honor reverse-proxy headers if present; fall back to Host
  const xfProto = req.headers.get('x-forwarded-proto')
  const xfHost  = req.headers.get('x-forwarded-host')
  const host    = xfHost ?? req.headers.get('host') ?? 'localhost:3000'
  const proto   = xfProto ?? (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https')
  return `${proto}://${host}`
}