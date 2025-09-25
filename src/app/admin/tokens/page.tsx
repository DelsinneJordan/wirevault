import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

function randShortId(n = 6) {
  const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: n }, () => alpha[Math.floor(Math.random() * alpha.length)]).join('')
}
function randPin() {
  return String(Math.floor(10000 + Math.random()*90000))
}

async function generate(formData: FormData) {
  'use server'
  if (!getAdminSession()) redirect('/admin/login')
  const count = Math.max(1, Math.min(1000, Number(formData.get('count')||'1')))
  const saltRounds = Number(process.env.PIN_HASH_SALT_ROUNDS || 10)
  const rows = []
  for (let i=0; i<count; i++) {
    const shortId = randShortId()
    const pin = randPin()
    const pinHash = await bcrypt.hash(pin, saltRounds)
    rows.push({ shortId, pinHash, status: 'UNASSIGNED' as const })
  }
  await prisma.qrToken.createMany({ data: rows })
  revalidatePath('/admin/tokens')
}

export default async function TokensPage() {
  if (!getAdminSession()) redirect('/admin/login')

  const tokens = await prisma.qrToken.findMany({
    orderBy: [{ status: 'asc' }, { shortId: 'asc' }],
    take: 200
  })

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">QR Tokens</h1>
        <form action={generate} className="flex items-center gap-2">
          <input name="count" type="number" min={1} max={1000} defaultValue={20} className="border rounded-xl px-3 py-2 w-28"/>
          <button className="btn-brand" type="submit">Generate</button>
        </form>
      </div>

      <ul className="grid gap-2">
        {tokens.map(t => (
          <li key={t.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{t.shortId}</div>
              <div className="text-xs text-gray-500">Status: {t.status}</div>
            </div>
            <div className="text-sm text-gray-600">
              {t.siteId ? <>Site #{t.siteId}</> : 'Unassigned'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
