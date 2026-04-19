import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const theme = await prisma.appTheme.findFirst();
    if (!theme) return console.log("no themes");
    console.log("Before:", theme.isActive);
    await prisma.$executeRaw\`UPDATE app_themes SET is_active = ${!theme.isActive} WHERE id = ${theme.id}\`;
    const themeAfter = await prisma.appTheme.findUnique({where: {id: theme.id}});
    console.log("After:", themeAfter?.isActive);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
