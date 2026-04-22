import axios from 'axios';

export class SmsProvider {
  /**
   * Dispatches SMS sending to the appropriate provider.
   */
  static async send(provider: string, phone: string, otp: string, config: any) {
    switch (provider.toLowerCase()) {
      case 'msg91':
        return this.sendViaMsg91(phone, otp, config);
      case 'firebase':
        return this.sendViaFirebase(phone, otp, config);
      default:
        throw new Error(`Cloud SMS provider ${provider} not implemented.`);
    }
  }

  private static async sendViaMsg91(phone: string, otp: string, config: any) {
    const { authKey, templateId, senderId } = config;
    
    if (!authKey || !templateId) {
      throw new Error('Incomplete MSG91 configuration.');
    }

    // MSG91 API call format
    try {
      const response = await axios.post('https://api.msg91.com/api/v5/otp', null, {
        params: {
          template_id: templateId,
          mobile: phone,
          authkey: authKey,
          otp: otp,
        },
      });
      
      if (response.data.type === 'error') {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error: any) {
      console.error('MSG91 Error:', error.response?.data || error.message);
      throw new Error(`MSG91 sending failed: ${error.message}`);
    }
  }

  private static async sendViaFirebase(phone: string, otp: string, config: any) {
    // Note: Firebase server-side OTP sending usually requires Firebase Admin SDK 
    // and is typically handled by the CLIENT (Firebase SDK) while the BACKEND
    // verifies the ID token. 
    // If the requirement is to TRIGGER it from backend, we might use Firebase Identity Toolkit API.
    // For now, we'll log it as Firebase typically handles sending via its own UI logic on mobile.
    console.log(`[Firebase SMS Simulation] Sending OTP ${otp} to ${phone}`);
    // This is a placeholder since Firebase is usually client-driven.
    // However, if the user specifically wants backend-triggered Firebase OTP:
    // https://cloud.google.com/identity-platform/docs/reference/rest/v1/accounts/sendVerificationCode
    return { success: true, provider: 'firebase' };
  }
}
