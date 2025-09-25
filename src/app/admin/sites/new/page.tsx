import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function createSite(formData: FormData) {
  'use server'
  if (!getAdminSession()) redirect('/admin/login')

  const shortId = String(formData.get('shortId') || '').trim()
  const name = String(formData.get('name') || '').trim()
  const customer = String(formData.get('customer') || '').trim()
  const address = String(formData.get('address') || '').trim()

  await prisma.site.create({ data: { shortId, name, customer, address } })
  revalidatePath('/admin/sites')
  redirect('/admin/sites')
}

export default async function NewSitePage() {
  if (!getAdminSession()) redirect('/admin/login')

  return (
    <form action={createSite} className="max-w-lg card grid gap-3">
      <h1 className="text-xl font-semibold">New Site</h1>
      <label className="text-sm">Short ID</label>
      <input name="shortId" required className="border rounded-xl px-3 py-2" />

      <label className="text-sm">Name</label>
      <input name="name" required className="border rounded-xl px-3 py-2" />

      <label className="text-sm">Customer</label>
      <input name="customer" required className="border rounded-xl px-3 py-2" />

      <label className="text-sm">Address</label>
      <input name="address" required className="border rounded-xl px-3 py-2" />

      <div className="flex gap-2">
        <button className="btn-brand" type="submit">Create</button>
      </div>
    </form>
  )
}
