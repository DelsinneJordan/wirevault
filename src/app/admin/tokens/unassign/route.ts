// app/api/admin/sites/[id]/tokens/assign/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { tokenShortId } = await req.json()
  await prisma.qrToken.update({
    where: { shortId: tokenShortId },
    data: { siteId: Number(params.id), status: 'UNASSIGNED' }
  })
  return NextResponse.json({ ok: true })
}
