import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type Params = { params: { id: string } }

async function saveBoard(formData: FormData) {
  'use server'
  if (!getAdminSession()) redirect('/admin/login')
  const id = Number(formData.get('id'))

  const data = {
    name: String(formData.get('name') || '').trim(),
    type: String(formData.get('type') || '') || null,
    supplyType: String(formData.get('supplyType') || '') || null,
    voltage: String(formData.get('voltage') || '') || null,
    earthingSystem: String(formData.get('earthingSystem') || '') || null,
    incomingCable: String(formData.get('incomingCable') || '') || null,
    ratedCurrent: String(formData.get('ratedCurrent') || '') || null,
    frequency: String(formData.get('frequency') || '') || null,
    solar: (formData.get('solar') as string) === 'yes' ? true : (formData.get('solar') as string) === 'no' ? false : null,
    description: String(formData.get('description') || '') || null,
    lastInspection: formData.get('lastInspection') ? new Date(String(formData.get('lastInspection'))) : null,
    nextInspection: formData.get('nextInspection') ? new Date(String(formData.get('nextInspection'))) : null,
  } as any

  await prisma.board.update({ where: { id }, data })
  await prisma.boardChange.create({
    data: { boardId: id, message: 'Updated board fields (admin)' }
  })
  revalidatePath(`/admin/boards/${id}`)
}

export default async function ManageBoard({ params }: Params) {
  if (!getAdminSession()) redirect('/admin/login')

  const id = Number(params.id)
  const board = await prisma.board.findUnique({
    where: { id },
    include: { site: true }
  })
  if (!board) return <div className="card">Unknown board</div>

  return (
    <form action={saveBoard} className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Board</h1>
        <a href={`/b/${board.shortId}`} className="btn-ghost" target="_blank">Open public page</a>
      </div>

      <input type="hidden" name="id" value={board.id} />

      <div className="card grid md:grid-cols-2 gap-3">
        <Field label="Name"><input name="name" defaultValue={board.name} className="border rounded-xl px-3 py-2 w-full" /></Field>
        <Field label="Type"><input name="type" defaultValue={board.type ?? ''} className="border rounded-xl px-3 py-2 w-full" /></Field>
        <Field label="Supply type"><input name="supplyType" defaultValue={board.supplyType ?? ''} className="border rounded-xl px-3 py-2 w-full" /></Field>
        <Field label="Voltage"><input name="voltage" defaultValue={board.voltage ?? ''} className="border rounded-xl px-3 py-2 w-full" /></Field>
        <Field label="Earthing system"><input name="earthingSystem" defaultValue={board.earthingSystem ?? ''} className="border rounded-xl px-3 py-2 w-full" /></Field>
        <Field label="Incoming cable"><input name="incomingCable" defaultValue={board.incomingCable ?? ''} className="border rounded-xl px-3 py-2 w-full" /></Field>
        <Field label="Rated current (In)"><input name="ratedCurrent" defaultValue={board.ratedCurrent ?? ''} className="border rounded-xl px-3 py-2 w-full" /></Field>
        <Field label="Frequency (Hz)"><input name="frequency" defaultValue={board.frequency ?? ''} className="border rounded-xl px-3 py-2 w-full" /></Field>
        <Field label="Solar">
          <select name="solar" defaultValue={board.solar === true ? 'yes' : board.solar === false ? 'no' : ''} className="border rounded-xl px-3 py-2 w-full">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>
        <Field label="Last inspection"><input type="date" name="lastInspection" defaultValue={board.lastInspection ? board.lastInspection.toISOString().slice(0,10) : ''} className="border rounded-xl px-3 py-2 w-full" /></Field>
        <Field label="Next inspection due"><input type="date" name="nextInspection" defaultValue={board.nextInspection ? board.nextInspection.toISOString().slice(0,10) : ''} className="border rounded-xl px-3 py-2 w-full" /></Field>
        <div className="md:col-span-2">
          <div className="text-xs text-gray-500">Description</div>
          <textarea name="description" defaultValue={board.description ?? ''} className="border rounded-xl px-3 py-2 w-full min-h-[100px]" />
        </div>
      </div>

      <div>
        <button className="btn-brand" type="submit">Save changes</button>
      </div>

      <div className="text-sm text-gray-600">
        Site: <b>{board.site?.name}</b> ({board.site?.shortId})
      </div>

      <div className="card">
        <a className="btn-ghost" href={`/admin/boards/${board.id}/docs`}>Manage documents</a>
        {/* use your existing docs admin page if you have one */}
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      {children}
    </label>
  )
}
