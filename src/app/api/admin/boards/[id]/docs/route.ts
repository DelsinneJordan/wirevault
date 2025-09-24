import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminSession()) return new NextResponse('Unauthorized', { status: 401 })
  const boardId = Number(params.id)
  const board = await prisma.board.findUnique({ where: { id: boardId } })
  if (!board) return new NextResponse('Not found', { status: 404 })

  const data = await req.formData()
  const file = data.get('file') as File | null
  const label = String(data.get('label') || '')
  if (!file || !label) return new NextResponse('Bad request', { status: 400 })

  const uploadRoot = process.env.UPLOAD_ROOT || 'public/uploads'
  const dir = path.join(uploadRoot, board.shortId)
  await fs.mkdir(dir, { recursive: true })
  const arrayBuffer = await file.arrayBuffer()
  const buf = Buffer.from(arrayBuffer)

  const filePath = path.join(dir, file.name)
  await fs.writeFile(filePath, buf)

  const storageKey = `${board.shortId}/${file.name}`
  await prisma.boardDoc.create({ data: { boardId, label, mime: (file as any).type || 'application/octet-stream', storageKey } })

  return NextResponse.redirect(new URL(`/admin/boards/${board.id}`, req.url))
}
