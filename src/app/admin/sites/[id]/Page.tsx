import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import Link from 'next/link'

type Params = { params: { id: string } }

async function updateSite(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  if (!getAdminSession()) redirect('/admin/login')
  await prisma.site.update({
    where: { id },
    data: {
      shortId: String(formData.get('shortId') || '').trim(),
      name: String(formData.get('name') || '').trim(),
      customer: String(formData.get('customer') || '').trim(),
      address: String(formData.get('address') || '').trim(),
    }
  })
  revalidatePath(`/admin/sites/${id}`)
}

async function createBoard(formData: FormData) {
  'use server'
  if (!getAdminSession()) redirect('/admin/login')
  const siteId = Number(formData.get('siteId'))
  const shortId = String(formData.get('shortId') || '').trim()
  const name = String(formData.get('name') || '').trim()
  await prisma.board.create({ data: { siteId, shortId, name } })
  revalidatePath(`/admin/sites/${siteId}`)
}

async function assignToken(formData: FormData) {
  'use server'
  if (!getAdminSession()) redirect('/admin/login')
  const siteId = Number(formData.get('siteId'))
  const tokenShortId = String(formData.get('tokenShortId') || '').trim()
  await prisma.qrToken.update({
    where: { shortId: tokenShortId },
    data: { siteId, status: 'ASSIGNED' }
  })
  revalidatePath(`/admin/sites/${siteId}`)
}

async function unassignToken(formData: FormData) {
  'use server'
  if (!getAdminSession()) redirect('/admin/login')
  const siteId = Number(formData.get('siteId'))
  const tokenId = Number(formData.get('tokenId'))
  await prisma.qrToken.update({
    where: { id: tokenId },
    data: { siteId: null, status: 'UNASSIGNED' }
  })
  revalidatePath(`/admin/sites/${siteId}`)
}

async function resetPin(formData: FormData) {
  'use server'
  if (!getAdminSession()) redirect('/admin/login')
  const siteId = Number(formData.get('siteId'))
  const tokenId = Number(formData.get('tokenId'))
  const pin = String(formData.get('pin') || '').trim()
  const saltRounds = Number(process.env.PIN_HASH_SALT_ROUNDS || 10)
  const pinHash = await bcrypt.hash(pin, saltRounds)
  await prisma.qrToken.update({ where: { id: tokenId }, data: { pinHash } })
  revalidatePath(`/admin/sites/${siteId}`)
}

export default async function ManageSitePage({ params }: Params) {
  if (!getAdminSession()) redirect('/admin/login')

  const id = Number(params.id)
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      boards: { orderBy: { name: 'asc' } },
      qrTokens: { orderBy: { shortId: 'asc' } },
    }
  })
  if (!site) return <div className="card">Unknown site</div>

  const unassigned = await prisma.qrToken.findMany({
    where: { status: 'UNASSIGNED', siteId: null },
    orderBy: { shortId: 'asc' },
    take: 50
  })

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Site</h1>
        <Link href="/admin/sites" className="btn-ghost">Back</Link>
      </div>

      {/* Edit site */}
      <form action={updateSite} className="card grid gap-2 max-w-2xl">
        <input type="hidden" name="id" value={site.id} />
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500">Short ID</div>
            <input name="shortId" defaultValue={site.shortId} className="border rounded-xl px-3 py-2 w-full" required/>
          </div>
          <div>
            <div className="text-xs text-gray-500">Name</div>
            <input name="name" defaultValue={site.name} className="border rounded-xl px-3 py-2 w-full" required/>
          </div>
          <div>
            <div className="text-xs text-gray-500">Customer</div>
            <input name="customer" defaultValue={site.customer} className="border rounded-xl px-3 py-2 w-full" required/>
          </div>
          <div>
            <div className="text-xs text-gray-500">Address</div>
            <input name="address" defaultValue={site.address} className="border rounded-xl px-3 py-2 w-full" required/>
          </div>
        </div>
        <div className="pt-2">
          <button className="btn-brand" type="submit">Save site</button>
        </div>
      </form>

      {/* Boards at site */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Boards</h2>
          <details>
            <summary className="btn-ghost cursor-pointer">Add board</summary>
            <form action={createBoard} className="mt-3 grid gap-2">
              <input type="hidden" name="siteId" value={site.id} />
              <input name="shortId" placeholder="Short ID (e.g., DEMO02)" required className="border rounded-xl px-3 py-2"/>
              <input name="name" placeholder="Board name" required className="border rounded-xl px-3 py-2"/>
              <button className="btn-brand w-fit" type="submit">Create board</button>
            </form>
          </details>
        </div>

        <ul className="grid gap-2">
          {site.boards.map(b => (
            <li key={b.id} className="card flex items-center justify-between">
              <div className="font-medium">{b.name}</div>
              <div className="text-sm text-gray-600">/{b.shortId}</div>
              <div className="flex gap-2">
                <Link className="btn-ghost" href={`/admin/boards/${b.id}`}>Manage board</Link>
                <Link className="btn-brand" href={`/b/${b.shortId}`}>Open public details</Link>
              </div>
            </li>
          ))}
          {site.boards.length === 0 && <li className="card">No boards yet.</li>}
        </ul>
      </div>

      {/* QR tokens for this site */}
      <div className="grid gap-3">
        <h2 className="text-lg font-semibold">QR tokens assigned to site</h2>
        <ul className="grid gap-2">
          {site.qrTokens.map(t => (
            <li key={t.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">Token: {t.shortId}</div>
                <div className="text-sm text-gray-600">Status: {t.status}</div>
              </div>
              <div className="flex gap-2 items-center">
                <form action={resetPin}>
                  <input type="hidden" name="siteId" value={site.id}/>
                  <input type="hidden" name="tokenId" value={t.id}/>
                  <input name="pin" placeholder="New PIN (5 digits)" pattern="\d{5}" maxLength={5}
                         className="border rounded-xl px-3 py-2 w-36" required/>
                  <button className="btn-ghost" type="submit">Set PIN</button>
                </form>
                <form action={unassignToken}>
                  <input type="hidden" name="siteId" value={site.id}/>
                  <input type="hidden" name="tokenId" value={t.id}/>
                  <button className="btn-ghost" type="submit">Unassign</button>
                </form>
              </div>
            </li>
          ))}
          {site.qrTokens.length === 0 && <li className="card">No tokens assigned.</li>}
        </ul>

        <div className="card">
          <h3 className="font-medium mb-2">Assign an existing token to this site</h3>
          <form action={assignToken} className="flex gap-2 items-center">
            <input type="hidden" name="siteId" value={site.id}/>
            <input name="tokenShortId" list="unassignedTokens" placeholder="Token shortId" className="border rounded-xl px-3 py-2"/>
            <datalist id="unassignedTokens">
              {unassigned.map(u => <option key={u.id} value={u.shortId} />)}
            </datalist>
            <button className="btn-brand" type="submit">Assign</button>
          </form>
          <div className="text-xs text-gray-500 mt-2">
            {unassigned.length} unassigned tokens shown (top 50).
          </div>
        </div>
      </div>
    </div>
  )
}
