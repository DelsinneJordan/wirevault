import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminHome() {
  const admin = getAdminSession(); if (!admin) redirect('/admin/login')
  const boards = await prisma.board.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Boards</h1>
        <div className="flex gap-3">
          <Link href="/admin/boards/new" className="btn-brand">New board</Link>
          <Link href="/admin/tokens" className="btn-ghost">QR tokens</Link>
        </div>
      </div>
      <ul className="grid gap-3">
        {boards.map(b => (
          <li key={b.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{b.name} <span className="badge">{b.shortId}</span></div>
              <div className="text-sm text-gray-600">{b.customerName} • {b.siteAddress}</div>
            </div>
            <div className="flex gap-2">
              <Link className="btn-ghost" href={`/b/${b.shortId}`}>Public</Link>
              <Link className="btn-ghost" href={`/admin/boards/${b.id}`}>Manage</Link>
            </div>
          </li>
        ))}
        {boards.length === 0 && <li className="card">No boards yet.</li>}
      </ul>
    </div>
  )
}
