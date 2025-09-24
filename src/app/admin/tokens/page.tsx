import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export default async function TokensPage() {
  const admin = getAdminSession(); if (!admin) redirect('/admin/login')

  async function generate(data: FormData) {
    'use server'
    const prefix = String(data.get('prefix') || 'BOARD')
    const count = Number(data.get('count') || 10)
    const pin = String(data.get('pin') || '')
    const rounds = Number(process.env.PIN_HASH_SALT_ROUNDS || 10)
    const batch: { shortId: string, pinHash: string }[] = []
    for (let i = 0; i < count; i++) {
      const shortId = `${prefix}${(Math.random()*1e6|0).toString(36).toUpperCase().slice(0,5)}`
      const pinVal = pin || ('' + (Math.floor(10000 + Math.random() * 90000)))
      const pinHash = await bcrypt.hash(pinVal, rounds)
      batch.push({ shortId, pinHash })
    }
    await prisma.$transaction(batch.map(b => prisma.qrToken.create({ data: { ...b, status: 'UNASSIGNED' } })))
    redirect('/admin/tokens')
  }

  const tokens = await prisma.qrToken.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })

  return (
    <div className="grid gap-6">
      <form action={generate} className="card grid gap-3">
        <h2 className="text-xl font-semibold">Generate QR tokens</h2>
        <div className="grid grid-cols-2 gap-3">
          <input name="prefix" placeholder="Prefix (e.g., DEMO)" className="border rounded-xl px-3 py-2" />
          <input name="count" type="number" min={1} max={100} defaultValue={10} className="border rounded-xl px-3 py-2" />
          <input name="pin" placeholder="Optional fixed PIN (5 digits)" className="border rounded-xl px-3 py-2" />
        </div>
        <button className="btn-brand" type="submit">Generate</button>
      </form>

      <div className="grid gap-3">
        <h3 className="font-semibold">Recent tokens</h3>
        <ul className="grid gap-2">
          {tokens.map(t => (
            <li key={t.id} className="card flex items-center justify-between">
              <div className="font-mono">{t.shortId}</div>
              <div className="badge">{t.status}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
