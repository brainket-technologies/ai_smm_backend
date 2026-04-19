import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const theme = await prisma.appTheme.findFirst()
  console.log('--- REVEALING THEME SCHEMA AT RUNTIME ---')
  console.log(JSON.stringify(theme, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2))
  console.log('--- END OF REVEAL ---')
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
