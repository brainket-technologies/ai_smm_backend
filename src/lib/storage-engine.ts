import fs from 'fs/promises';
import path from 'path';
import prisma from './prisma';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Assuming firebase-admin is initialized elsewhere or using default credentials
  // For safety, we check if it's initialized.
}

/**
 * Storage Engine Utility
 * Handles file saving logic for both Cloud and Local Storage based on active configuration.
 */
export class StorageEngine {
  /**
   * Saves a file to the active storage provider.
   */
  static async saveFile(file: Buffer, fileName: string, category: string = 'general', mimeType?: string) {
    try {
      // 1. Fetch active storage config
      const activeConfig = await prisma.externalServiceConfig.findFirst({
        where: { 
          category: 'storage',
          isActive: true 
        }
      });

      const provider = activeConfig?.provider || 'local_storage';
      const config: any = activeConfig?.config || {};

      if (provider === 'local_storage') {
        const localConfig = { 
          uploadPath: config.uploadPath || 'public/uploads', 
          publicPath: config.publicPath || '/uploads' 
        };
        return await this.saveToLocal(file, fileName, localConfig, category);
      }

      if (provider === 'firebase') {
        return await this.saveToFirebase(file, fileName, config, category, mimeType);
      }

      if (provider === 'cloudinary') {
        return await this.saveToCloudinary(file, fileName, config, category);
      }

      if (provider === 's3' || provider === 'aws' || provider === 'r2' || provider === 'cloudflare_r2' || provider === 'aws_s3' || provider === 'cloudflare') {
        return await this.saveToS3(file, fileName, config, category, mimeType);
      }

      throw new Error(`Storage provider ${provider} not supported.`);
    } catch (error) {
      console.error("StorageEngine Error:", error);
      throw error;
    }
  }

  /**
   * Internal helper for local disk storage.
   */
  private static async saveToLocal(file: Buffer, fileName: string, config: any, category: string) {
    const rootPath = process.cwd();
    const relativeUploadDir = config.uploadPath || 'public/uploads';
    const publicPrefix = config.publicPath || '/uploads';
    
    const targetDir = path.join(rootPath, relativeUploadDir, category);
    
    // Ensure directory exists
    await fs.mkdir(targetDir, { recursive: true });
    
    const filePath = path.join(targetDir, fileName);
    await fs.writeFile(filePath, file);
    
    // Return the public URL
    return `${publicPrefix}/${category}/${fileName}`;
  }

  /**
   * Internal helper for Firebase Storage.
   */
  private static async saveToFirebase(file: Buffer, fileName: string, config: any, category: string, mimeType?: string) {
    const bucketName = config.bucketUrl || process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) throw new Error('Firebase Storage Bucket URL not configured.');

    const bucket = admin.storage().bucket(bucketName);
    const destination = `${category}/${fileName}`;
    const firebaseFile = bucket.file(destination);

    await firebaseFile.save(file, {
      metadata: {
        contentType: mimeType || 'application/octet-stream',
      },
      public: true,
    });

    // Get the public URL
    // Firebase public URLs typically follow this pattern:
    // https://storage.googleapis.com/BUCKET_NAME/FILE_PATH
    return `https://storage.googleapis.com/${bucket.name}/${destination}`;
  }

  /**
   * Internal helper for Cloudinary Storage.
   */
  private static async saveToCloudinary(file: Buffer, fileName: string, config: any, category: string) {
    const { v2: cloudinary } = require('cloudinary');

    cloudinary.config({
      cloud_name: config.cloudName || process.env.CLOUDINARY_CLOUD_NAME,
      api_key: config.apiKey || process.env.CLOUDINARY_API_KEY,
      api_secret: config.apiSecret || process.env.CLOUDINARY_API_SECRET,
    });

    return new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: category,
          public_id: path.parse(fileName).name,
          resource_type: 'auto',
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      ).end(file);
    });
  }

  /**
   * Internal helper for S3-compatible storage (AWS S3, Cloudflare R2).
   */
  private static async saveToS3(file: Buffer, fileName: string, config: any, category: string, mimeType?: string) {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    
    // Cloudflare R2 specific handling
    const endpoint = config.endpointUrl || 
                    (config.accountId ? `https://${config.accountId}.r2.cloudflarestorage.com` : undefined);
    
    const s3Client = new S3Client({
      region: config.region || 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: config.accessKeyId || config.accessKey || process.env.STORAGE_ACCESS_KEY,
        secretAccessKey: config.secretAccessKey || config.secretKey || process.env.STORAGE_SECRET_KEY,
      },
    });

    const bucketName = config.bucketName || config.bucket || process.env.STORAGE_BUCKET;
    const key = `${category}/${fileName}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType || 'application/octet-stream',
    }));

    // Generate public URL
    if (config.publicUrl) {
      return `${config.publicUrl.replace(/\/$/, '')}/${key}`;
    }
    
    // Default S3/R2 pattern
    return endpoint 
      ? `${endpoint}/${bucketName}/${key}`
      : `https://${bucketName}.s3.${config.region || 'us-east-1'}.amazonaws.com/${key}`;
  }
}
