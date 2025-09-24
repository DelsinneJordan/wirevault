import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getBoardSession } from '@/lib/cookies'

export default async function DocsPage({ params }: { params: { shortId: string } }) {
  const session = getBoardSession(params.shortId)
  if (!session) return <div className="card">Session expired or invalid. <Link href={`/b/${params.shortId}`} className="btn-ghost ml-2">Re-enter PIN</Link></div>

  const board = await prisma.board.findUnique({ where: { shortId: params.shortId }, include: { docs: true } })
  if (!board) return <div className="card">Unknown board.</div>

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Documents for {board.name}</h2>
      <ul className="grid gap-3">
        {board.docs.map(d => (
          <li key={d.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{d.label}</div>
              <div className="text-sm text-gray-600">{d.mime}</div>
            </div>
            <a className="btn-brand" href={`/uploads/${d.storageKey}`} download>Download</a>
          </li>
        ))}
        {board.docs.length === 0 && <li className="card">No documents yet.</li>}
      </ul>
      <div className="text-sm text-gray-600">Session auto-expires in ~{process.env.SESSION_TTL_MINUTES || 20} minutes.</div>
    </div>
  )
}
