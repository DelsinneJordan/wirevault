import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/cookies'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function DELETE(req: NextRequest, { params }: { params: { id: string, docId: string } }) {
  if (!getAdminSession()) return new NextResponse('Unauthorized', { status: 401 })
  const boardId = Number(params.id)
  const docId = Number(params.docId)
  const doc = await prisma.boardDoc.findUnique({ where: { id: docId } })
  if (!doc || doc.boardId !== boardId) return new NextResponse('Not found', { status: 404 })

  const uploadRoot = process.env.UPLOAD_ROOT || 'public/uploads'
  const filePath = path.join(uploadRoot, doc.storageKey)
  await prisma.boardDoc.delete({ where: { id: docId } })
  await fs.rm(filePath, { force: true })
  return new NextResponse(null, { status: 204 })
}
