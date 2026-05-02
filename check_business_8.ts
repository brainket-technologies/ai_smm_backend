import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const business = await prisma.business.findUnique({
    where: { id: BigInt(8) }
  })
  console.log('Business 8:', business ? business.name : 'Not found')
}

main()
