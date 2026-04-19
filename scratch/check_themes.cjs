const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const theme = await prisma.appTheme.findFirst()
    console.log('--- REVEALING THEME RAW KEYS ---')
    if (theme) {
      console.log('Keys:', Object.keys(theme))
      console.log('Full Object:', JSON.stringify(theme, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      , 2))
    } else {
      console.log('No themes found in database.')
    }
    console.log('--- END OF REVEAL ---')
  } catch (error) {
    console.error('Error fetching theme:', error)
  }
}

main()
  .finally(async () => await prisma.$disconnect())
