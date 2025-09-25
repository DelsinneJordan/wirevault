import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { buildSiteSessionCookie } from '@/lib/cookies'
import { getRequestOrigin } from '@/lib/url'

export async function POST(req: NextRequest, { params }: { params: { shortId: string } }) {
  const siteShortId = params.shortId
  const form = await req.formData()
  const pin = String(form.get('pin') || '')

  const site = await prisma.site.findUnique({ where: { shortId: siteShortId } })
  const origin = getRequestOrigin(req)
  if (!site) return NextResponse.redirect(`${origin}/s/${siteShortId}?error=unknown-site`)

  const tokens = await prisma.qrToken.findMany({
    where: { siteId: site.id, status: { not: 'RETIRED' } }
  })

  let ok = false
  for (const t of tokens) {
    if (await bcrypt.compare(pin, t.pinHash)) { ok = true; break }
  }

  await prisma.accessLog.create({
    data: { shortId: siteShortId, success: ok, siteId: site.id,
            ip: (req as any).ip ?? null, userAgent: req.headers.get('user-agent') ?? undefined }
  })

  if (!ok) return NextResponse.redirect(`${origin}/s/${siteShortId}?error=pin`)

  const cookie = buildSiteSessionCookie(siteShortId)
  const res = NextResponse.redirect(`${origin}/s/${siteShortId}/boards`)
  res.cookies.set(cookie.name, cookie.value, cookie.options)
  return res
}
