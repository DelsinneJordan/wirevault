import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

function keyOf(b: any) {
  // group boards into the same Site by customer+address (tweak if you prefer)
  const c = (b.customerName || '').trim().toLowerCase()
  const a = (b.siteAddress || '').trim().toLowerCase()
  return `${c}||${a}`
}

async function main() {
  const boards = await prisma.board.findMany()
  const siteByKey = new Map<string, number>()
  let seq = 1

  for (const b of boards) {
    const key = keyOf(b)
    let siteId = siteByKey.get(key) || 0

    if (!siteId) {
      // make a readable site shortId; adjust to your liking
      const shortId = `SITE-${String(seq).padStart(3, '0')}`
      seq++

      const site = await prisma.site.create({
        data: {
          shortId,
          name: (b.siteAddress && b.customerName)
            ? `${b.customerName} – ${b.siteAddress}`
            : `Site for ${b.name}`,
          customer: b.customerName || 'Unknown',
          address: b.siteAddress || 'Unknown',
        },
      })
      siteId = site.id
      siteByKey.set(key, siteId)
    }

    // attach board to site
    await prisma.board.update({
      where: { id: b.id },
      data: { siteId },
    })

    // move legacy board token (if any) to the site
    if (b.qrTokenId) {
      try {
        await prisma.qrToken.update({
          where: { id: b.qrTokenId },
          data: { siteId, status: 'ASSIGNED' },
        })
      } catch {
        // ignore if token id not found
      }
    }
  }

  console.log('Backfill complete')
}

main().finally(() => prisma.$disconnect())
