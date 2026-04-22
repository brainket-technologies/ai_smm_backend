import nodemailer from 'nodemailer';

export class EmailProvider {
  /**
   * Dispatches Email sending to the appropriate provider.
   */
  static async send(provider: string, email: string, otp: string, config: any) {
    switch (provider.toLowerCase()) {
      case 'smtp':
        return this.sendViaSmtp(email, otp, config);
      default:
        throw new Error(`Email provider ${provider} not implemented.`);
    }
  }

  private static async sendViaSmtp(email: string, otp: string, config: any) {
    const { host, port, user, pass, from, appName } = config;

    if (!host || !port || !user || !pass) {
      throw new Error('Incomplete SMTP configuration.');
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: from || `"${appName || 'App'}" <${user}>`,
      to: email,
      subject: `Your Verification Code: ${otp}`,
      text: `Your verification code is ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2>Verification Code</h2>
          <p>Please use the following code to complete your login:</p>
          <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, provider: 'smtp' };
    } catch (error: any) {
      console.error('SMTP Error (logged but continuing):', error.message);
      // Return success: false but don't throw, allowing the API to return the static OTP
      return { success: false, provider: 'smtp', error: error.message };
    }
  }
}
