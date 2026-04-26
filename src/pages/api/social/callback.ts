import type { NextApiRequest, NextApiResponse } from 'next';
import { SocialMediaService } from '../../lib/services/social-media-service';
import { CryptoService } from '../../lib/services/crypto-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, state, error } = req.query;

  console.log(`[PagesSocialCallback] Received callback. Code: ${code ? 'yes' : 'no'}, State: ${state ? 'yes' : 'no'}, Error: ${error || 'none'}`);

  if (error) {
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(error as string)}`;
    return res.send(`<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`);
  }

  if (!code || !state) {
    return res.status(400).json({ success: false, message: 'Missing code or state' });
  }

  try {
    // 1. Decrypt state
    const decryptedState = JSON.parse(CryptoService.decrypt(state as string));
    const platform = decryptedState.platform;
    
    // 2. Fetch profiles
    const protocol = 'https';
    const host = req.headers.host;
    const redirectUri = `${protocol}://${host}/api/social/callback`;

    console.log(`[PagesSocialCallback] Fetching profiles for ${platform}`);
    const profiles = await SocialMediaService.getProfilesFromCallback(platform, code as string, redirectUri);
    console.log(`[PagesSocialCallback] Found ${profiles.length} profiles`);

    if (profiles.length === 0) {
      const deepLink = `brandboost://oauth?status=no_pages&platform=${platform}`;
      return res.send(`<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`);
    }

    // 3. Compact profiles for deep link
    const optimizedProfiles = profiles.map(p => ({
      id: p.id,
      name: p.name,
      username: p.username,
      profile_picture: p.profile_picture,
      platform: p.platform,
      account_type: p.account_type,
      page_id: p.page_id,
      access_token: p.access_token,
      refresh_token: p.refresh_token
    })).slice(0, 10); // Safe limit

    const profilesData = encodeURIComponent(JSON.stringify(optimizedProfiles));
    const deepLink = `brandboost://oauth?status=profiles&platform=${platform}&profiles=${profilesData}`;

    console.log(`[PagesSocialCallback] Sending deep link. Size: ${deepLink.length}`);

    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <html>
        <head><title>Success</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff;">
          <div style="text-align:center;">
            <div style="font-size:3rem;">✅</div>
            <h2>Connected!</h2>
            <p>Returning to app...</p>
            <script>setTimeout(()=>{ window.location='${deepLink}'; }, 500);</script>
          </div>
        </body>
      </html>
    `);

  } catch (error: any) {
    console.error('[PagesSocialCallback] Error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error_description || error.message;
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(errorMessage)}`;
    return res.send(`<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`);
  }
}
