
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tokens = await prisma.deviceToken.findMany({
    where: { isActive: true },
    select: { userId: true, fcmToken: true, deviceId: true }
  });

  const duplicates = {};
  tokens.forEach(t => {
    const key = `${t.userId}_${t.fcmToken}`;
    if (!duplicates[key]) duplicates[key] = [];
    duplicates[key].push(t.deviceId);
  });

  console.log('Duplicate FCM Tokens for same user:');
  Object.keys(duplicates).forEach(key => {
    if (duplicates[key].length > 1) {
      console.log(`User_Token: ${key}, DeviceIds: ${duplicates[key].join(', ')}`);
    }
  });

  const userTokens = {};
  tokens.forEach(t => {
    if (!userTokens[t.userId]) userTokens[t.userId] = [];
    userTokens[t.userId].push(t.fcmToken);
  });

  console.log('\nUsers with multiple active tokens:');
  Object.keys(userTokens).forEach(uid => {
    if (userTokens[uid].length > 1) {
      console.log(`User: ${uid}, Tokens Count: ${userTokens[uid].length}`);
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
