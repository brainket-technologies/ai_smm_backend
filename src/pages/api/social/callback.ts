import type { NextApiRequest, NextApiResponse } from 'next';
import { SocialMediaService } from '@/lib/services/social-media-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] SocialCallback Received - URL: ${req.url}`);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, state, error } = req.query;

  if (error) {
    console.error(`[${timestamp}] Callback error from platform: ${error}`);
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(error as string)}`;
    return res.send(`<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`);
  }

  if (!code || !state) {
    console.warn(`[${timestamp}] Missing code or state. Code: ${code ? 'yes' : 'no'}, State: ${state ? 'yes' : 'no'}`);
    return res.status(400).json({ success: false, message: 'Missing code or state' });
  }

  try {
    // 1. Parse state
    console.log(`[${timestamp}] Parsing state: ${state}`);
    const decryptedState = SocialMediaService.parseState(state as string);
    const platform = decryptedState.platform;
    const businessId = decryptedState.businessId;

    console.log(`[${timestamp}] State parsed - Platform: ${platform}, BusinessId: ${businessId}`);
    
    if (!platform) {
      throw new Error('Platform not found in state');
    }

    // 2. Fetch profiles
    const protocol = 'https';
    const host = req.headers.host;
    const redirectUri = `${protocol}://${host}/api/social/callback`;

    console.log(`[${timestamp}] Fetching profiles for ${platform} using code.`);
    const profiles = await SocialMediaService.getProfilesFromCallback(platform, code as string, redirectUri);
    console.log(`[${timestamp}] Found ${profiles.length} profiles.`);

    if (profiles.length === 0) {
      console.warn(`[${timestamp}] No profiles found for this account.`);
      const deepLink = `brandboost://oauth?status=no_pages&platform=${platform}`;
      return res.send(`<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`);
    }

    // 3. Compact profiles for deep link
    const optimizedProfiles = profiles.map((p: any) => ({
      id: p.id,
      name: p.name,
      username: p.username,
      profile_picture: p.profile_picture,
      platform: p.platform,
      account_type: p.account_type,
      page_id: p.page_id,
      access_token: p.access_token,
      refresh_token: p.refresh_token
    })).slice(0, 10);

    const profilesData = encodeURIComponent(JSON.stringify(optimizedProfiles));
    const deepLink = `brandboost://oauth?status=profiles&platform=${platform}&profiles=${profilesData}`;

    console.log(`[${timestamp}] Success. Sending deep link (Length: ${deepLink.length})`);

    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <html>
        <head><title>Success</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff;">
          <div style="text-align:center;">
            <div style="font-size:3rem;">✅</div>
            <h2 style="color:#22c55e;">Connected Successfully!</h2>
            <p>Please wait while we take you back to the app...</p>
            <script>setTimeout(()=>{ window.location='${deepLink}'; }, 800);</script>
          </div>
        </body>
      </html>
    `);

  } catch (error: any) {
    console.error(`[${timestamp}] Callback Processing Error:`, error.message);
    const errorMessage = error.response?.data?.error_description || error.message;
    const deepLink = `brandboost://oauth?status=error&message=${encodeURIComponent(errorMessage)}`;
    return res.send(`<html><head><meta http-equiv="refresh" content="0;url=${deepLink}"></head><body><script>window.location='${deepLink}'</script></body></html>`);
  }
}
