import { prisma } from '@/lib/prisma'

export default async function SitePinPage({ params }: { params: { shortId: string } }) {
  const site = await prisma.site.findUnique({ where: { shortId: params.shortId } })
  if (!site) return <div className="card">Unknown site</div>

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl font-semibold">{site.name}</h2>
      <p className="text-sm text-gray-600">{site.customer} • {site.address}</p>

      <form action={`/s/${params.shortId}/verify`} method="post" className="mt-6 grid gap-3">
        <label className="text-sm">Enter 5-digit PIN</label>
        <input name="pin" inputMode="numeric" pattern="\d{5}" required maxLength={5}
               className="border rounded-xl px-3 py-2" />
        <button className="btn-brand" type="submit">Open site</button>
      </form>
    </div>
  )
}
