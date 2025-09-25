import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSiteSession } from '@/lib/cookies'

export const dynamic = 'force-dynamic'

export default async function BoardDetails({ params }: { params: { shortId: string } }) {
  const board = await prisma.board.findUnique({
    where: { shortId: params.shortId },
    include: { site: true, docs: true, changes: { orderBy: { createdAt: 'desc' } } },
  })
  if (!board) return <div className="card">Unknown board.</div>

  // Gate by site session
  const siteCookie = getSiteSession(board.site.shortId)
  if (!siteCookie) {
    return (
      <div className="card">
        Session expired for site <b>{board.site.name}</b>.
        <Link className="btn-ghost ml-2" href={`/s/${board.site.shortId}`}>Re-enter PIN</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{board.name}</h1>
        <div className="text-sm text-gray-600">
          {board.site.name} • {board.site.customer} • {board.site.address}
        </div>
      </div>

      {/* Electrical details */}
      <div className="card grid grid-cols-1 md:grid-cols-2 gap-2">
        <Detail label="Board type" value={board.type} />
        <Detail label="Supply type" value={board.supplyType} />
        <Detail label="Voltage" value={board.voltage} />
        <Detail label="Earthing system" value={board.earthingSystem} />
        <Detail label="Incoming cable" value={board.incomingCable} />
        <Detail label="Rated current (In)" value={board.ratedCurrent} />
        <Detail label="Frequency (Hz)" value={board.frequency} />
        <Detail label="Solar" value={board.solar ? 'Yes' : board.solar === false ? 'No' : ''} />
        <Detail label="Last inspection" value={board.lastInspection?.toISOString().slice(0,10)} />
        <Detail label="Next inspection due" value={board.nextInspection?.toISOString().slice(0,10)} />
        <Detail label="Description" value={board.description} wide />
      </div>

      {/* Documents */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Documents</h2>
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
      </div>

      {/* Modifications log */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Modifications log</h2>
        <ul className="grid gap-2">
          {board.changes.map(c => (
            <li key={c.id} className="text-sm text-gray-700">
              {new Date(c.createdAt).toLocaleString()} — {c.message}
            </li>
          ))}
          {board.changes.length === 0 && <li className="text-sm text-gray-600">No changes recorded.</li>}
        </ul>
      </div>
    </div>
  )
}

function Detail({ label, value, wide=false }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value || '—'}</div>
    </div>
  )
}
