import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { buildBoardSessionCookie } from '@/lib/cookies'
import { getRequestOrigin } from '@/lib/url'

export async function POST(req: NextRequest, { params }: { params: { shortId: string } }) {
  const form = await req.formData()
  const pin = String(form.get('pin') || '')
  const shortId = params.shortId

  const token = await prisma.qrToken.findUnique({ where: { shortId } })
  const ok = !!token && token.status !== 'RETIRED' && await bcrypt.compare(pin, token.pinHash)

  const board = await prisma.board.findUnique({ where: { shortId } })
  await prisma.accessLog.create({
    data: {
      shortId,
      success: ok,
      ip: (req as any).ip ?? null,
      userAgent: req.headers.get('user-agent') ?? undefined,
      boardId: board?.id,
    },
  })

  const origin = getRequestOrigin(req)

  if (!ok) {
    const back = `${origin}/b/${shortId}?error=pin`
    return NextResponse.redirect(back) // must be absolute in route handlers
  }

  const toDocs = `${origin}/b/${shortId}/docs`
  const cookie = buildBoardSessionCookie(shortId)
  const res = NextResponse.redirect(toDocs)
  res.cookies.set(cookie.name, cookie.value, cookie.options)
  return res
}
