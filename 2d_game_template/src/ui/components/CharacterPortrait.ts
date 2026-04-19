/**
 * 角色立绘组件
 * 显示小爱的不同表情立绘
 */

import { logger } from '../../core/DebugLogger';
import { ImageProcessor, CHARACTER_EXPRESSIONS, type CharacterExpression } from '../../assets/ImageProcessor';

export interface PortraitConfig {
  containerId: string;
  basePath: string;
  defaultExpression?: CharacterExpression;
}

export class CharacterPortrait {
  private container: HTMLElement;
  private currentExpression: CharacterExpression = '微笑';
  private imageCache: Map<CharacterExpression, string> = new Map();
  private isLoaded: boolean = false;

  constructor(config: PortraitConfig) {
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`容器 #${config.containerId} 不存在`);
    }
    this.container = container;
    
    if (config.defaultExpression) {
      this.currentExpression = config.defaultExpression;
    }

    this.init();
    logger.log('info', 'CharacterPortrait', '角色立绘组件初始化完成');
  }

  /**
   * 初始化组件
   */
  private init(): void {
    this.container.className = 'anime-character-container';
    this.container.innerHTML = `
      <img id="portrait-image" class="anime-character-image anime-breathe" src="" alt="小爱">
    `;
  }

  /**
   * 预加载所有表情图片
   */
  async preloadAll(basePath: string): Promise<void> {
    logger.log('info', 'CharacterPortrait', '开始预加载角色图片');
    
    try {
      const processed = await ImageProcessor.preloadCharacterImages(
        basePath,
        [...CHARACTER_EXPRESSIONS]
      );

      for (const [expression, data] of processed) {
        this.imageCache.set(expression as CharacterExpression, data.url);
      }

      this.isLoaded = true;
      
      // 显示默认表情
      this.showExpression(this.currentExpression);
      
      logger.log('info', 'CharacterPortrait', '角色图片预加载完成', {
        count: this.imageCache.size
      });
    } catch (error) {
      logger.log('error', 'CharacterPortrait', '预加载失败', { error });
      throw error;
    }
  }

  /**
   * 显示指定表情
   */
  showExpression(expression: CharacterExpression): void {
    const imageUrl = this.imageCache.get(expression);
    if (!imageUrl) {
      logger.log('warn', 'CharacterPortrait', '表情图片未加载', { expression });
      return;
    }

    const img = this.container.querySelector('#portrait-image') as HTMLImageElement;
    if (img) {
      // 添加过渡效果
      img.style.opacity = '0';
      
      setTimeout(() => {
        img.src = imageUrl;
        img.style.opacity = '1';
      }, 150);

      this.currentExpression = expression;
      
      logger.log('debug', 'CharacterPortrait', '切换表情', { expression });
    }
  }

  /**
   * 根据情绪自动选择表情
   */
  showEmotion(emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral'): void {
    const emotionMap: Record<string, CharacterExpression> = {
      happy: '开心',
      sad: '紧张',
      angry: '生气',
      surprised: '惊慌',
      neutral: '微笑'
    };

    this.showExpression(emotionMap[emotion] || '微笑');
  }

  /**
   * 播放呼吸动画
   */
  playBreathing(): void {
    const img = this.container.querySelector('#portrait-image');
    if (img) {
      img.classList.add('anime-breathe');
    }
  }

  /**
   * 停止呼吸动画
   */
  stopBreathing(): void {
    const img = this.container.querySelector('#portrait-image');
    if (img) {
      img.classList.remove('anime-breathe');
    }
  }

  /**
   * 播放表情切换动画
   */
  playExpressionChange(expression: CharacterExpression): void {
    const img = this.container.querySelector('#portrait-image');
    if (!img) return;

    // 添加特效
    img.classList.add('anime-glow-strong');
    
    setTimeout(() => {
      this.showExpression(expression);
    }, 200);

    setTimeout(() => {
      img.classList.remove('anime-glow-strong');
    }, 800);
  }

  /**
   * 获取当前表情
   */
  getCurrentExpression(): CharacterExpression {
    return this.currentExpression;
  }

  /**
   * 检查是否已加载
   */
  isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    this.imageCache.clear();
    this.container.innerHTML = '';
    logger.log('info', 'CharacterPortrait', '组件已销毁');
  }
}

/**
 * 创建角色立绘组件的工厂函数
 */
export function createCharacterPortrait(config: PortraitConfig): CharacterPortrait {
  return new CharacterPortrait(config);
}
