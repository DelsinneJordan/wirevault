// app/b/[shortId]/page.tsx   (GET on old board QR without session)
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function LegacyBoardEntry({ params }: { params: { shortId: string } }) {
  const board = await prisma.board.findUnique({ where: { shortId: params.shortId }, include: { site: true } })
  if (!board) return <div className="card">Unknown board</div>
  redirect(`/s/${board.site.shortId}`)
}
