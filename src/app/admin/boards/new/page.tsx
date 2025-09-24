import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import { redirect } from 'next/navigation'

export default async function NewBoardPage() {
  const admin = getAdminSession(); if (!admin) redirect('/admin/login')

  async function create(formData: FormData) {
    'use server'
    const shortId = String(formData.get('shortId'))
    const name = String(formData.get('name'))
    const customerName = String(formData.get('customerName'))
    const siteAddress = String(formData.get('siteAddress'))
    const token = await prisma.qrToken.findUnique({ where: { shortId } })
    if (!token || token.status !== 'UNASSIGNED') throw new Error('Token must exist and be UNASSIGNED')
    const board = await prisma.board.create({ data: { shortId, name, customerName, siteAddress, state: 'ACTIVE', qrTokenId: token.id } })
    await prisma.qrToken.update({ where: { id: token.id }, data: { status: 'ASSIGNED' } })
    redirect(`/admin/boards/${board.id}`)
  }

  const tokens = await prisma.qrToken.findMany({ where: { status: 'UNASSIGNED' }, orderBy: { createdAt: 'asc' } })

  return (
    <form action={create} className="max-w-lg card grid gap-3">
      <h2 className="text-xl font-semibold">Create board</h2>
      <label className="text-sm">QR Token (shortId)</label>
      <select name="shortId" required className="border rounded-xl px-3 py-2">
        <option value="">Select unassigned token…</option>
        {tokens.map(t => <option key={t.id} value={t.shortId}>{t.shortId}</option>)}
      </select>
      <input name="name" required placeholder="Board name" className="border rounded-xl px-3 py-2" />
      <input name="customerName" required placeholder="Customer name" className="border rounded-xl px-3 py-2" />
      <input name="siteAddress" required placeholder="Site address" className="border rounded-xl px-3 py-2" />
      <button className="btn-brand" type="submit">Create</button>
    </form>
  )
}
