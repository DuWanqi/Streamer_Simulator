/**
 * 图片处理工具
 * 用于去除白色背景、处理角色立绘
 */

import { logger } from '../core/DebugLogger';

export interface ProcessedImage {
  url: string;
  width: number;
  height: number;
  originalUrl: string;
}

export class ImageProcessor {
  private static cache: Map<string, ProcessedImage> = new Map();

  /**
   * 加载图片
   */
  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * 去除白色背景
   * @param imageUrl 图片URL
   * @param threshold 白色阈值 (0-255)，默认240
   * @param tolerance 容差，默认15
   */
  static async removeWhiteBackground(
    imageUrl: string,
    threshold: number = 240,
    tolerance: number = 15
  ): Promise<string> {
    // 检查缓存
    const cached = this.cache.get(imageUrl);
    if (cached) {
      logger.debug('ImageProcessor', 'Using cached image', { imageUrl });
      return cached.url;
    }

    try {
      logger.info('ImageProcessor', 'Processing image', { imageUrl });
      
      const img = await this.loadImage(imageUrl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 遍历像素，将白色背景设为透明
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 检测白色背景（考虑容差）
        if (r > threshold && g > threshold && b > threshold) {
          // 计算与纯白的差距
          const diff = (255 - r) + (255 - g) + (255 - b);
          if (diff < tolerance * 3) {
            data[i + 3] = 0; // 设置透明
          }
        }
      }

      // 边缘平滑处理（可选）
      this.smoothEdges(data, canvas.width, canvas.height);

      ctx.putImageData(imageData, 0, 0);

      const processedUrl = canvas.toDataURL('image/png');
      
      // 缓存结果
      this.cache.set(imageUrl, {
        url: processedUrl,
        width: img.width,
        height: img.height,
        originalUrl: imageUrl
      });

      logger.info('ImageProcessor', 'Image processed successfully', {
        imageUrl,
        width: img.width,
        height: img.height
      });

      return processedUrl;
    } catch (error) {
      logger.error('ImageProcessor', 'Failed to process image', { imageUrl, error });
      throw error;
    }
  }

  /**
   * 边缘平滑处理
   * 减少锯齿，让边缘更自然
   */
  private static smoothEdges(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): void {
    const transparentPixels: number[] = [];

    // 找出所有透明像素
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) {
        transparentPixels.push(i);
      }
    }

    // 对透明像素周围的像素进行轻微透明处理
    transparentPixels.forEach(alphaIndex => {
      const pixelIndex = (alphaIndex - 3) / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);

      // 检查周围8个像素
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;

          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const neighborIndex = (ny * width + nx) * 4 + 3;
            if (data[neighborIndex] > 0) {
              // 轻微降低邻居像素的不透明度
              data[neighborIndex] = Math.floor(data[neighborIndex] * 0.9);
            }
          }
        }
      }
    });
  }

  /**
   * 批量处理图片
   */
  static async batchProcess(
    imageUrls: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const url = await this.removeWhiteBackground(imageUrls[i]);
        const processed = this.cache.get(imageUrls[i])!;
        results.push(processed);
        
        if (onProgress) {
          onProgress(i + 1, imageUrls.length);
        }
      } catch (error) {
        logger.error('ImageProcessor', 'Batch processing failed for image', {
          imageUrl: imageUrls[i],
          error
        });
      }
    }

    return results;
  }

  /**
   * 生成角色立绘（带透明背景）
   */
  static async processCharacterImage(
    imageUrl: string,
    expression?: string
  ): Promise<ProcessedImage> {
    const processedUrl = await this.removeWhiteBackground(imageUrl);
    const cached = this.cache.get(imageUrl)!;
    
    return {
      ...cached,
      url: processedUrl
    };
  }

  /**
   * 预加载并处理所有角色图片
   */
  static async preloadCharacterImages(
    basePath: string,
    expressions: string[]
  ): Promise<Map<string, ProcessedImage>> {
    const result = new Map<string, ProcessedImage>();

    for (const expression of expressions) {
      const imageUrl = `${basePath}/${expression}.png`;
      try {
        const processed = await this.processCharacterImage(imageUrl, expression);
        result.set(expression, processed);
      } catch (error) {
        logger.warn('ImageProcessor', 'Failed to preload expression', {
          expression,
          imageUrl
        });
      }
    }

    return result;
  }

  /**
   * 清空缓存
   */
  static clearCache(): void {
    this.cache.clear();
    logger.info('ImageProcessor', 'Cache cleared');
  }

  /**
   * 获取缓存统计
   */
  static getCacheStats(): {
    size: number;
    totalMemory: number;
  } {
    let totalMemory = 0;
    this.cache.forEach(item => {
      // 估算内存使用（base64字符串长度 * 0.75）
      totalMemory += item.url.length * 0.75;
    });

    return {
      size: this.cache.size,
      totalMemory: Math.floor(totalMemory / 1024) // KB
    };
  }
}

/**
 * 表情类型定义
 */
export const CHARACTER_EXPRESSIONS = [
  '厌恶',
  '尴尬2',
  '开心',
  '微笑',
  '恐惧',
  '惊慌',
  '生气',
  '紧张',
  '顽皮'
] as const;

export type CharacterExpression = typeof CHARACTER_EXPRESSIONS[number];

/**
 * 快捷函数：获取角色立绘URL
 */
export async function getCharacterPortrait(
  expression: CharacterExpression,
  basePath: string = '/prepared_assets/半身像'
): Promise<string> {
  const imageUrl = `${basePath}/${expression}.png`;
  return ImageProcessor.removeWhiteBackground(imageUrl);
}

/**
 * 快捷函数：获取完整立绘
 */
export async function getFullCharacter(
  basePath: string = '/prepared_assets/白毛1.3.png'
): Promise<string> {
  return ImageProcessor.removeWhiteBackground(basePath, 250, 20);
}
