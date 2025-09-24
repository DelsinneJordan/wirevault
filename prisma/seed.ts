import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'node:fs/promises'
import path from 'node:path'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@up2charge.be'
  const pw = process.env.ADMIN_SEED_PASSWORD || 'Admin123!'
  const uploadRoot = process.env.UPLOAD_ROOT || 'public/uploads'

  const password = await bcrypt.hash(pw, 10)
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password, role: 'ADMIN' }
  })

  const demoShort = 'DEMO01'
  const pinHash = await bcrypt.hash('12345', 10)
  const token = await prisma.qrToken.upsert({
    where: { shortId: demoShort },
    update: { pinHash, status: 'ASSIGNED' },
    create: { shortId: demoShort, pinHash, status: 'ASSIGNED' }
  })

  const board = await prisma.board.upsert({
    where: { shortId: demoShort },
    update: { qrTokenId: token.id },
    create: {
      shortId: demoShort,
      name: 'Demo Electrical Cabinet',
      customerName: 'CarTechCenter',
      siteAddress: 'Werkplaats Londerzeel',
      state: 'ACTIVE',
      qrToken: { connect: { id: token.id } }
    }
  })

  const dir = path.join(uploadRoot, board.shortId)
  await fs.mkdir(dir, { recursive: true })
  const samplePath = path.join(dir, 'One-line-diagram-demo.pdf')
  await fs.writeFile(samplePath, Buffer.from('%PDF-1.4\n% demo placeholder PDF'))

  await prisma.boardDoc.create({
    data: {
      boardId: board.id,
      label: 'One-line diagram (demo)',
      mime: 'application/pdf',
      storageKey: `${board.shortId}/One-line-diagram-demo.pdf`
    }
  })

  console.log('Seed complete: admin + DEMO01 (PIN 12345)')
}

main().finally(() => prisma.$disconnect())
