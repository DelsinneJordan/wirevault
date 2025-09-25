import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SitesPage() {
  if (!getAdminSession()) redirect('/admin/login')

  const sites = await prisma.site.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { boards: true, qrTokens: true } }
    }
  })

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sites</h1>
        <Link href="/admin/sites/new" className="btn-brand">New Site</Link>
      </div>

      <ul className="grid gap-3">
        {sites.map(s => (
          <li key={s.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-gray-600">{s.customer} • {s.address}</div>
              <div className="text-xs text-gray-500">
                {s._count.boards} boards • {s._count.qrTokens} QR tokens
              </div>
            </div>
            <Link href={`/admin/sites/${s.id}`} className="btn-ghost">Manage</Link>
          </li>
        ))}
        {sites.length === 0 && <li className="card">No sites yet.</li>}
      </ul>
    </div>
  )
}
