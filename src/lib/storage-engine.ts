import fs from 'fs/promises';
import path from 'path';
import prisma from './prisma';

/**
 * Storage Engine Utility
 * Handles file saving logic for both Cloud and Local Storage based on active configuration.
 */
export class StorageEngine {
  /**
   * Saves a file to the active storage provider.
   * Currently implements 'local_storage' as the primary manual method.
   */
  static async saveFile(file: Buffer, fileName: string, category: string = 'general') {
    try {
      // 1. Fetch active storage config
      const activeConfig = await prisma.externalServiceConfig.findFirst({
        where: { 
          category: 'storage',
          isActive: true 
        }
      });

      const provider = activeConfig?.provider || 'local_storage';
      const config: any = activeConfig?.config || { uploadPath: 'public/uploads', publicPath: '/uploads' };

      if (provider === 'local_storage') {
        return await this.saveToLocal(file, fileName, config, category);
      }

      // TODO: Implement S3 / Cloudinary logic here based on activeConfig
      throw new Error(`Storage provider ${provider} not yet implemented in engine.`);
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
}
