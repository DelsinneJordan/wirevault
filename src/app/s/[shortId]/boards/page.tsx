import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSiteSession } from '@/lib/cookies'

export const dynamic = 'force-dynamic'

export default async function SiteOverview({ params }: { params: { shortId: string } }) {
  const session = getSiteSession(params.shortId)
  if (!session) return <div className="card">Session expired. <Link className="btn-ghost ml-2" href={`/s/${params.shortId}`}>Re-enter PIN</Link></div>

  const site = await prisma.site.findUnique({
    where: { shortId: params.shortId },
    include: { boards: { orderBy: { name: 'asc' } } },
  })
  if (!site) return <div className="card">Unknown site</div>

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{site.name}</h1>
        <div className="text-sm text-gray-600">{site.customer} • {site.address}</div>
      </div>

      <div className="grid gap-3">
        <h2 className="text-lg font-semibold">Boards at this site</h2>
        <ul className="grid gap-3">
          {site.boards.map(b => (
            <li key={b.id} className="card flex items-center justify-between">
              <div className="font-medium">{b.name}</div>
              {/* Keep existing board detail URL (see section 4) */}
              <Link className="btn-brand" href={`/b/${b.shortId}`}>Open</Link>
            </li>
          ))}
          {site.boards.length === 0 && <li className="card">No boards yet.</li>}
        </ul>
      </div>
    </div>
  )
}
