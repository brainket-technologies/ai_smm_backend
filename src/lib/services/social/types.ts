export interface SocialProfile {
  id: string;
  name: string;
  username: string;
  profile_picture: string | null;
  platform: string;
  access_token: string;
  refresh_token?: string;
  account_type: string;
  page_id: string;
}

export interface SocialPlatformService {
  getAuthUrl(businessId: string, redirectUri: string): Promise<string>;
  getProfiles(code: string, redirectUri: string): Promise<SocialProfile[]>;
  disconnect(businessId: string, accountId: string): Promise<void>;
}
