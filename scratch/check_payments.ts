import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const methods = await prisma.paymentMethod.findMany()
    console.log("Found %d payment methods", methods.length)
    methods.forEach(m => {
      console.log(`- ${m.name}: image=${m.image}, isDefault=${m.isDefault}`)
    })
  } catch (error) {
    console.error("DB Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
