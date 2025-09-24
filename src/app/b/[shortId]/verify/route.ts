import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { setBoardSession } from '@/lib/cookies'

export async function POST(req: NextRequest, { params }: { params: { shortId: string } }) {
  const form = await req.formData()
  const pin = String(form.get('pin') || '')
  const shortId = params.shortId
  const token = await prisma.qrToken.findUnique({ where: { shortId } })
  const ok = !!token && token.status !== 'RETIRED' && await bcrypt.compare(pin, token.pinHash)

  const board = await prisma.board.findUnique({ where: { shortId } })
  await prisma.accessLog.create({ data: { shortId, success: ok, ip: (req as any).ip ?? null, userAgent: req.headers.get('user-agent') ?? undefined, boardId: board?.id } })

  if (!ok) return NextResponse.redirect(new URL(`/b/${shortId}?error=pin`, req.url))

  setBoardSession(shortId)
  return NextResponse.redirect(new URL(`/b/${shortId}/docs`, req.url))
}
