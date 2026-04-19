/**
 * 场景过渡动画组件
 * 处理场景切换效果
 */

import { logger } from '../../core/DebugLogger';

export class SceneTransition {
  private static overlay: HTMLElement | null = null;

  /**
   * 初始化过渡层
   */
  private static initOverlay(): void {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.id = 'scene-transition-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%);
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.5s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(this.overlay);
    logger.log('info', 'SceneTransition', '过渡层初始化完成');
  }

  /**
   * 淡入效果
   */
  static async fadeIn(element: HTMLElement, duration: number = 500): Promise<void> {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease`;
    
    // 强制重绘
    element.offsetHeight;
    
    element.style.opacity = '1';
    
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  /**
   * 淡出效果
   */
  static async fadeOut(element: HTMLElement, duration: number = 500): Promise<void> {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  /**
   * 场景切换（带过渡）
   */
  static async transition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    type: 'fade' | 'slide' | 'zoom' = 'fade',
    duration: number = 500
  ): Promise<void> {
    this.initOverlay();

    switch (type) {
      case 'fade':
        await this.fadeTransition(fromElement, toElement, duration);
        break;
      case 'slide':
        await this.slideTransition(fromElement, toElement, duration);
        break;
      case 'zoom':
        await this.zoomTransition(fromElement, toElement, duration);
        break;
    }

    logger.log('info', 'SceneTransition', '场景切换完成', { type });
  }

  /**
   * 淡入淡出过渡
   */
  private static async fadeTransition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    duration: number
  ): Promise<void> {
    // 显示过渡层
    if (this.overlay) {
      this.overlay.style.opacity = '1';
      this.overlay.style.pointerEvents = 'auto';
    }

    // 淡出当前场景
    fromElement.style.transition = `opacity ${duration / 2}ms ease`;
    fromElement.style.opacity = '0';

    await this.delay(duration / 2);

    // 隐藏当前场景，显示新场景
    fromElement.style.display = 'none';
    toElement.style.display = 'flex';
    toElement.style.opacity = '0';

    // 隐藏过渡层
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      this.overlay.style.pointerEvents = 'none';
    }

    // 淡入新场景
    toElement.style.transition = `opacity ${duration / 2}ms ease`;
    
    // 强制重绘
    toElement.offsetHeight;
    
    toElement.style.opacity = '1';

    await this.delay(duration / 2);
  }

  /**
   * 滑动过渡
   */
  private static async slideTransition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    duration: number
  ): Promise<void> {
    // 设置初始状态
    fromElement.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
    toElement.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
    
    toElement.style.display = 'flex';
    toElement.style.position = 'absolute';
    toElement.style.top = '0';
    toElement.style.left = '0';
    toElement.style.width = '100%';
    toElement.style.transform = 'translateX(100%)';
    toElement.style.opacity = '0';

    // 强制重绘
    toElement.offsetHeight;

    // 执行动画
    fromElement.style.transform = 'translateX(-100%)';
    fromElement.style.opacity = '0';
    
    toElement.style.transform = 'translateX(0)';
    toElement.style.opacity = '1';

    await this.delay(duration);

    // 清理
    fromElement.style.display = 'none';
    fromElement.style.transform = '';
    fromElement.style.opacity = '';
    
    toElement.style.position = '';
    toElement.style.transform = '';
  }

  /**
   * 缩放过渡
   */
  private static async zoomTransition(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    duration: number
  ): Promise<void> {
    // 设置初始状态
    fromElement.style.transition = `transform ${duration / 2}ms ease, opacity ${duration / 2}ms ease`;
    toElement.style.transition = `transform ${duration / 2}ms ease, opacity ${duration / 2}ms ease`;
    
    toElement.style.display = 'flex';
    toElement.style.transform = 'scale(0.8)';
    toElement.style.opacity = '0';

    // 第一阶段：当前场景缩小消失
    fromElement.style.transform = 'scale(1.2)';
    fromElement.style.opacity = '0';

    await this.delay(duration / 2);

    // 隐藏当前场景
    fromElement.style.display = 'none';
    fromElement.style.transform = '';
    fromElement.style.opacity = '';

    // 第二阶段：新场景放大出现
    toElement.style.transform = 'scale(1)';
    toElement.style.opacity = '1';

    await this.delay(duration / 2);
  }

  /**
   * 显示加载动画
   */
  static showLoading(text: string = '加载中...'): void {
    this.initOverlay();
    
    if (this.overlay) {
      this.overlay.innerHTML = `
        <div class="anime-loading">
          <div class="anime-loading-spinner"></div>
          <div class="anime-loading-text">${text}</div>
        </div>
      `;
      this.overlay.style.opacity = '1';
      this.overlay.style.pointerEvents = 'auto';
    }

    logger.log('info', 'SceneTransition', '显示加载动画');
  }

  /**
   * 隐藏加载动画
   */
  static hideLoading(): void {
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      this.overlay.style.pointerEvents = 'none';
      this.overlay.innerHTML = '';
    }

    logger.log('info', 'SceneTransition', '隐藏加载动画');
  }

  /**
   * 延迟函数
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 销毁组件
   */
  static destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.remove();
      this.overlay = null;
    }
    logger.log('info', 'SceneTransition', '组件已销毁');
  }
}

/**
 * 创建场景过渡的工厂函数
 */
export function createSceneTransition(): typeof SceneTransition {
  return SceneTransition;
}
