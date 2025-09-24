import { prisma } from '@/lib/prisma'

export default async function BoardPinPage({ params }: { params: { shortId: string } }) {
  const board = await prisma.board.findUnique({ where: { shortId: params.shortId } })
  if (!board) return <div className="card">Unknown board.</div>

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl font-semibold">Board: {board.name}</h2>
      <p className="text-sm text-gray-600">Customer: {board.customerName} • Site: {board.siteAddress}</p>
      <form action={`/b/${params.shortId}/verify`} method="post" className="mt-6 grid gap-3">
        <label className="text-sm">Enter 5-digit PIN</label>
        <input name="pin" inputMode="numeric" pattern="\d{5}" required maxLength={5} className="border rounded-xl px-3 py-2" />
        <button className="btn-brand" type="submit">Unlock dossier</button>
      </form>
    </div>
  )
}
