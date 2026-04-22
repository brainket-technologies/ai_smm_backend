import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import prisma from '../../lib/prisma';

export class SocialProvider {
  /**
   * Verifies the social token and returns user information.
   */
  static async verify(type: string, token: string, config: any) {
    switch (type.toLowerCase()) {
      case 'google':
        return this.verifyGoogle(token, config);
      case 'apple':
        return this.verifyApple(token, config);
      default:
        throw new Error(`Social provider ${type} not implemented.`);
    }
  }

  private static async verifyGoogle(token: string, config: any) {
    const { clientId } = config;
    if (!clientId) throw new Error('Google Client ID not configured.');

    const client = new OAuth2Client(clientId);
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid Google token payload.');

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        image: payload.picture,
        success: true,
      };
    } catch (error: any) {
      console.error('Google Auth Error:', error.message);
      throw new Error(`Google token verification failed: ${error.message}`);
    }
  }

  private static async verifyApple(token: string, config: any) {
    const { clientId } = config; // Service ID or App ID
    if (!clientId) throw new Error('Apple Client ID (Service ID) not configured.');

    try {
      const payload: any = await appleSignin.verifyIdToken(token, {
        audience: clientId,
        ignoreExpiration: false,
      });

      const { sub: appleId, email, name } = payload;

      return {
        id: appleId,
        email: email,
        name: name ? `${name.firstName} ${name.lastName}` : undefined,
        success: true,
      };
    } catch (error: any) {
      console.error('Apple Auth Error:', error.message);
      throw new Error(`Apple token verification failed: ${error.message}`);
    }
  }
}
