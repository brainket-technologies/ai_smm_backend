
import prisma from '@/lib/prisma';
import { EmailProvider } from './providers/email-provider';

export class InvoiceEmailService {
  /**
   * Sends a professional invoice email after successful subscription purchase.
   */
  static async sendInvoice(userId: bigint, gatewayOrderId: string, tierKey: string) {
    try {
      // 1. Fetch User and check if email notifications are enabled
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { currency: true }
      });

      if (!user || !user.email || !user.emailEnabled) {
        console.log(`[Invoice] Skipping email for user ${userId} (Email disabled or not found)`);
        return;
      }

      // 2. Fetch Transaction and Tier Details
      const transaction = await prisma.subscriptionTransaction.findUnique({
        where: { gatewayOrderId }
      });

      const tier = await prisma.subscriptionTier.findUnique({
        where: { tierKey }
      });

      if (!transaction || !tier) {
        console.error('[Invoice] Transaction or Tier not found for email.');
        return;
      }

      // 3. Fetch SMTP Config from DB
      const smtpConfigRecord = await prisma.externalServiceConfig.findFirst({
        where: { category: 'email_otp', provider: 'smtp', isActive: true }
      });

      if (!smtpConfigRecord) {
        console.warn('[Invoice] No active SMTP configuration found in DB.');
        return;
      }

      const smtpConfig = smtpConfigRecord.config as any;
      const appConfig = await prisma.appConfig.findFirst({ orderBy: { createdAt: 'desc' } });

      // 4. Construct Invoice HTML
      const amount = Number(transaction.amount).toFixed(2);
      const currency = transaction.currency || 'INR';
      const date = new Date(transaction.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Invoice</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Order #${gatewayOrderId}</p>
          </div>
          
          <div style="padding: 30px; color: #333;">
            <p>Hi <b>${user.name || 'Valued Customer'}</b>,</p>
            <p>Thank you for choosing <b>${appConfig?.appName || 'BrandBoost AI'}</b>! Your subscription to the <b>${tier.name} Plan</b> has been successfully activated.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #27AE60; border-bottom: 1px solid #eee; padding-bottom: 10px;">Payment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Plan Name</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${tier.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Billing Period</td>
                  <td style="padding: 8px 0; text-align: right;">${tier.pricePeriod === 'year' ? 'Annual' : 'Monthly'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Date</td>
                  <td style="padding: 8px 0; text-align: right;">${date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Payment Gateway</td>
                  <td style="padding: 8px 0; text-align: right; text-transform: capitalize;">${transaction.gateway}</td>
                </tr>
                <tr style="border-top: 2px solid #eee;">
                  <td style="padding: 15px 0 0; color: #333; font-size: 18px; font-weight: bold;">Total Paid</td>
                  <td style="padding: 15px 0 0; text-align: right; color: #27AE60; font-size: 22px; font-weight: bold;">${currency} ${amount}</td>
                </tr>
              </table>
            </div>
            
            <p style="line-height: 1.6;">Your subscription features are now available in your account. You can manage your subscription settings anytime from the app.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px;">
              <p>If you have any questions, feel free to contact us at <a href="mailto:${appConfig?.supportEmail || 'support@brandboostai.com'}" style="color: #27AE60;">${appConfig?.supportEmail || 'support@brandboostai.com'}</a></p>
              <p>&copy; ${new Date().getFullYear()} ${appConfig?.appName || 'BrandBoost AI'}. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;

      const subject = `Invoice for your ${tier.name} Plan - ${appConfig?.appName || 'BrandBoost AI'}`;

      await EmailProvider.sendEmail(
        user.email,
        subject,
        html,
        `Thank you for your purchase of ${tier.name} Plan for ${currency} ${amount}.`,
        smtpConfig
      );

      console.log(`[Invoice] Email sent successfully to ${user.email}`);

    } catch (error: any) {
      console.error('[Invoice] Failed to send invoice email:', error);
    }
  }
}
