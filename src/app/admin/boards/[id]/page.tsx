import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import { redirect } from 'next/navigation'
import DeleteButton from '@/components/DeleteButton'

export default async function BoardManage({ params }: { params: { id: string } }) {
  const admin = getAdminSession(); if (!admin) redirect('/admin/login')
  const id = Number(params.id)
  const board = await prisma.board.findUnique({ where: { id }, include: { docs: true, qrToken: true } })
  if (!board) return <div className="card">Board not found</div>

  return (
    <div className="grid gap-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{board.name} <span className="badge">{board.shortId}</span></h2>
            <div className="text-sm text-gray-600">{board.customerName} • {board.siteAddress}</div>
          </div>
          <form action={`/b/${board.shortId}`}>
            <button className="btn-ghost">View public</button>
          </form>
        </div>
      </div>

      <form action={`/api/admin/boards/${board.id}/docs`} method="post" encType="multipart/form-data" className="card grid gap-3">
        <h3 className="font-semibold">Upload document</h3>
        <input name="label" required placeholder="Label (e.g., One-line diagram)" className="border rounded-xl px-3 py-2" />
        <input name="file" type="file" accept="application/pdf,image/*" required className="border rounded-xl px-3 py-2" />
        <button className="btn-brand" type="submit">Upload</button>
      </form>

      <div className="grid gap-3">
        <h3 className="font-semibold">Documents</h3>
        <ul className="grid gap-3">
          {board.docs.map(d => (
            <li key={d.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">{d.label}</div>
                <div className="text-sm text-gray-600">{d.mime}</div>
              </div>
              <div className="flex gap-2">
                <a className="btn-ghost" href={`/uploads/${d.storageKey}`} download>Download</a>
                <DeleteButton boardId={board.id} docId={d.id} />
              </div>
            </li>
          ))}
          {board.docs.length === 0 && <li className="card">No documents yet.</li>}
        </ul>
      </div>
    </div>
  )
}
