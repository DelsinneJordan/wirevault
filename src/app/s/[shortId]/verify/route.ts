import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { buildSiteSessionCookie } from '@/lib/cookies'
import { getRequestOrigin } from '@/lib/url'

export async function POST(req: NextRequest, { params }: { params: { shortId: string } }) {
  const { shortId } = params
  const form = await req.formData()
  const pin = String(form.get('pin') || '')

  const token = await prisma.qrToken.findFirst({ where: { shortId, site: { shortId }, status: { not: 'RETIRED' } } })
  const ok = !!token && await bcrypt.compare(pin, token!.pinHash)

  await prisma.accessLog.create({
    data: {
      shortId, success: ok,
      site: { connect: { shortId } },
      ip: (req as any).ip ?? null,
      userAgent: req.headers.get('user-agent') ?? undefined,
    }
  })

  const origin = getRequestOrigin(req)

  if (!ok) return NextResponse.redirect(`${origin}/s/${shortId}?error=pin`)

  const cookie = buildSiteSessionCookie(shortId)
  const res = NextResponse.redirect(`${origin}/s/${shortId}/boards`)
  res.cookies.set(cookie.name, cookie.value, cookie.options)
  return res
}
