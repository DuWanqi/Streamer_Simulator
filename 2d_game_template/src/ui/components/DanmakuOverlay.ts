/**
 * 弹幕层组件
 * 显示滚动的弹幕消息
 */

import { logger } from '../../core/DebugLogger';
import type { DanmakuMessage } from '../../systems/DanmakuSystem';

export interface DanmakuOverlayConfig {
  containerId: string;
  maxDanmaku?: number;
}

export class DanmakuOverlay {
  private container: HTMLElement;
  private maxDanmaku: number;
  private danmakuElements: HTMLElement[] = [];
  private isRunning: boolean = false;

  constructor(config: DanmakuOverlayConfig) {
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`容器 #${config.containerId} 不存在`);
    }
    this.container = container;
    this.maxDanmaku = config.maxDanmaku || 50;
    this.init();
    logger.log('info', 'DanmakuOverlay', '弹幕层组件初始化完成');
  }

  /**
   * 初始化组件
   */
  private init(): void {
    this.container.className = 'anime-danmaku-container';
    this.container.style.cssText = `
      position: relative;
      overflow: hidden;
      height: 200px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
    `;
  }

  /**
   * 添加弹幕
   */
  addDanmaku(message: DanmakuMessage & { text?: string; isGift?: boolean; giftAmount?: number }): void {
    const danmakuEl = document.createElement('div');
    danmakuEl.className = 'anime-danmaku-item';
    danmakuEl.textContent = message.text || message.content;
    
    // 根据人格设置颜色
    const colors: Record<string, string> = {
      'laofen': '#ffb6c1',
      'heifen': '#ff6b6b',
      'fanyi': '#87ceeb',
      'yanwenzi': '#dda0dd',
      'kaoju': '#90ee90',
      'nainai': '#ffd700',
      'gengbaike': '#ff69b4',
      'qianshui': '#00ced1'
    };
    
    const color = colors[message.personalityId] || '#ffffff';
    
    // 随机轨道
    const track = Math.floor(Math.random() * 5);
    const top = 20 + track * 36;
    
    // 随机速度
    const duration = 6 + Math.random() * 4;
    
    danmakuEl.style.cssText = `
      position: absolute;
      white-space: nowrap;
      font-size: 14px;
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.5);
      color: ${color};
      top: ${top}px;
      left: 100%;
      animation: danmakuMove ${duration}s linear forwards;
      text-shadow: 0 0 5px ${color};
    `;

    // 添加打赏标识
    if (message.isGift && message.giftAmount) {
      danmakuEl.textContent = `🎁 ${message.text || message.content}`;
      danmakuEl.style.fontWeight = 'bold';
      danmakuEl.style.fontSize = '16px';
    }

    this.container.appendChild(danmakuEl);
    this.danmakuElements.push(danmakuEl);

    // 动画结束后移除
    setTimeout(() => {
      this.removeDanmaku(danmakuEl);
    }, duration * 1000);

    // 限制弹幕数量
    if (this.danmakuElements.length > this.maxDanmaku) {
      const oldDanmaku = this.danmakuElements.shift();
      if (oldDanmaku && oldDanmaku.parentNode) {
        oldDanmaku.remove();
      }
    }

    logger.log('debug', 'DanmakuOverlay', '添加弹幕', { 
      text: (message.text || message.content).substring(0, 20),
      personality: message.personalityName 
    });
  }

  /**
   * 移除弹幕
   */
  private removeDanmaku(element: HTMLElement): void {
    const index = this.danmakuElements.indexOf(element);
    if (index > -1) {
      this.danmakuElements.splice(index, 1);
    }
    if (element.parentNode) {
      element.remove();
    }
  }

  /**
   * 清空弹幕
   */
  clear(): void {
    this.danmakuElements.forEach(el => {
      if (el.parentNode) {
        el.remove();
      }
    });
    this.danmakuElements = [];
    logger.log('info', 'DanmakuOverlay', '弹幕已清空');
  }

  /**
   * 暂停弹幕
   */
  pause(): void {
    this.danmakuElements.forEach(el => {
      el.style.animationPlayState = 'paused';
    });
    this.isRunning = false;
  }

  /**
   * 恢复弹幕
   */
  resume(): void {
    this.danmakuElements.forEach(el => {
      el.style.animationPlayState = 'running';
    });
    this.isRunning = true;
  }

  /**
   * 是否正在运行
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    this.clear();
    logger.log('info', 'DanmakuOverlay', '组件已销毁');
  }
}

/**
 * 创建弹幕层组件的工厂函数
 */
export function createDanmakuOverlay(config: DanmakuOverlayConfig): DanmakuOverlay {
  return new DanmakuOverlay(config);
}
