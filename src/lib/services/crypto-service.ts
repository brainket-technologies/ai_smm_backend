import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommended for GCM
const AUTH_TAG_LENGTH = 16;

export class CryptoService {
  private static getSecretKey(): Buffer {
    const secret = process.env.ENCRYPTION_KEY || 'ai-social-default-secret-key-32-chars!!';
    
    // Always derive a 32-byte key using a hash to be safe
    return crypto.createHash('sha256').update(secret).digest();
  }

  static encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const key = this.getSecretKey();
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag().toString('hex');
      
      // Format: iv:authTag:encrypted
      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error: any) {
      console.error('[CryptoService] Encryption failed:', error.message);
      throw error;
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
      
      if (!ivHex || !authTagHex || !encryptedText) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const key = this.getSecretKey();
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error: any) {
      console.error('[CryptoService] Decryption failed:', error.message);
      throw error;
    }
  }
}
