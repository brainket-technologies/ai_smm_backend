const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const axios = require('axios');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function refreshProfilePictures() {
  const accounts = await prisma.socialAccount.findMany({
    include: {
      platform: true
    }
  });

  for (const account of accounts) {
    const platform = account.platform.nameKey;
    if (platform !== 'facebook' && platform !== 'instagram') continue;

    console.log(`Refreshing ${platform} account: ${account.accountName}`);
    
    try {
      const accessToken = Buffer.from(account.accessToken, 'base64').toString('utf8');
      let newPictureUrl = null;

      if (platform === 'facebook') {
        // Fetch fresh picture for FB Page
        const res = await axios.get(`https://graph.facebook.com/v22.0/${account.accountId}`, {
          params: { fields: 'picture.type(large)', access_token: accessToken }
        });
        newPictureUrl = res.data.picture?.data?.url;
      } else if (platform === 'instagram') {
        // Fetch fresh picture for IG account
        const res = await axios.get(`https://graph.instagram.com/v22.0/${account.accountId}`, {
          params: { fields: 'profile_picture_url', access_token: accessToken }
        });
        newPictureUrl = res.data.profile_picture_url;
      }

      if (newPictureUrl) {
        await prisma.socialAccount.update({
          where: { id: account.id },
          data: { profilePicture: newPictureUrl }
        });
        console.log(`  Updated URL: ${newPictureUrl.substring(0, 50)}...`);
      } else {
        console.log(`  No new URL found.`);
      }
    } catch (error) {
      console.error(`  Error refreshing ${account.accountName}:`, error.response?.data || error.message);
    }
  }
}

refreshProfilePictures()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
