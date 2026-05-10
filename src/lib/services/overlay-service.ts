import sharp from 'sharp';
import axios from 'axios';

export class OverlayService {
  /**
   * Applies brand overlays (logo, price, watermark) to an image.
   */
  static async applyOverlays(params: {
    imageUrl: string;
    logoUrl?: string;
    price?: string;
    watermarkText?: string;
  }): Promise<Buffer> {
    // Download base image
    const baseImageResponse = await axios.get(params.imageUrl, { responseType: 'arraybuffer' });
    let image = sharp(baseImageResponse.data);
    const metadata = await image.metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    const composites: any[] = [];

    // 1. Logo Overlay (Top-Right) - Professional placement
    if (params.logoUrl) {
      try {
        const logoResponse = await axios.get(params.logoUrl, { responseType: 'arraybuffer' });
        const logo = await sharp(logoResponse.data)
          .resize({ width: Math.round(width * 0.15) }) // 15% of width
          .toBuffer();
        
        composites.push({
          input: logo,
          top: Math.round(height * 0.05),
          left: width - Math.round(width * 0.20),
        });
      } catch (e) {
        console.error("Error applying logo overlay:", e);
      }
    }

    // 2. Price Tag Overlay (Bottom-Right)
    if (params.price) {
      const priceText = params.price.startsWith('₹') || params.price.startsWith('$') ? params.price : `₹${params.price}`;
      const priceTag = await this.createPriceTag(priceText, width);
      composites.push({
        input: priceTag,
        top: height - Math.round(height * 0.12),
        left: width - Math.round(width * 0.25),
      });
    }

    // 3. Watermark (Bottom-Center)
    if (params.watermarkText) {
      const watermark = await this.createWatermark(params.watermarkText, width);
      composites.push({
        input: watermark,
        top: height - Math.round(height * 0.06),
        left: Math.round(width / 2) - Math.round(width * 0.15),
      });
    }

    return image.composite(composites).toBuffer();
  }

  /**
   * Creates a stylish SVG price tag.
   */
  private static async createPriceTag(price: string, imageWidth: number): Promise<Buffer> {
    const width = Math.round(imageWidth * 0.22);
    const height = Math.round(imageWidth * 0.08);
    const fontSize = Math.round(height * 0.6);
    
    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="rgba(0,0,0,0.75)" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${fontSize}px" font-weight="bold">${price}</text>
      </svg>
    `;
    return Buffer.from(svg);
  }

  /**
   * Creates a subtle watermark SVG.
   */
  private static async createWatermark(text: string, imageWidth: number): Promise<Buffer> {
    const width = Math.round(imageWidth * 0.3);
    const height = Math.round(imageWidth * 0.05);
    const fontSize = Math.round(height * 0.7);

    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="Arial, sans-serif" font-size="${fontSize}px">${text}</text>
      </svg>
    `;
    return Buffer.from(svg);
  }
}
