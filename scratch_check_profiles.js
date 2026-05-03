const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSocialAccounts() {
  const accounts = await prisma.socialAccount.findMany({
    select: {
      accountName: true,
      platform: {
        select: {
          nameKey: true
        }
      },
      profilePicture: true,
    }
  });

  console.log(JSON.stringify(accounts, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

checkSocialAccounts()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
