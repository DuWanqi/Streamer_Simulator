/**
 * 对话框组件
 * 带打字机效果的对话显示
 */

import { logger } from '../../core/DebugLogger';

export interface DialogConfig {
  containerId: string;
  speaker?: string;
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export class DialogBox {
  private container: HTMLElement;
  private isTyping: boolean = false;
  private currentText: string = '';
  private typingInterval: number | null = null;
  private onCompleteCallback?: () => void;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`容器 #${containerId} 不存在`);
    }
    this.container = container;
    this.init();
    logger.log('info', 'DialogBox', '对话框组件初始化完成');
  }

  /**
   * 初始化组件
   */
  private init(): void {
    this.container.className = 'anime-dialog-box';
    this.container.innerHTML = `
      <div class="anime-dialog-speaker"></div>
      <div class="anime-dialog-text"></div>
    `;
  }

  /**
   * 显示对话（带打字机效果）
   */
  async showText(config: DialogConfig): Promise<void> {
    // 如果正在打字，先停止
    if (this.isTyping) {
      this.skipTyping();
    }

    const { speaker, text, speed = 50, onComplete } = config;
    this.onCompleteCallback = onComplete;

    // 设置说话者
    const speakerEl = this.container.querySelector('.anime-dialog-speaker');
    if (speakerEl && speaker) {
      speakerEl.textContent = speaker;
    }

    // 开始打字
    this.isTyping = true;
    this.currentText = text;
    
    const textEl = this.container.querySelector('.anime-dialog-text');
    if (!textEl) return;

    textEl.textContent = '';
    
    return new Promise((resolve) => {
      let index = 0;
      
      this.typingInterval = window.setInterval(() => {
        if (index < text.length) {
          textEl.textContent += text[index];
          index++;
        } else {
          this.finishTyping();
          resolve();
        }
      }, speed);
    });
  }

  /**
   * 跳过打字动画
   */
  skipTyping(): void {
    if (!this.isTyping) return;

    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }

    const textEl = this.container.querySelector('.anime-dialog-text');
    if (textEl) {
      textEl.textContent = this.currentText;
    }

    this.finishTyping();
    logger.log('debug', 'DialogBox', '跳过打字动画');
  }

  /**
   * 完成打字
   */
  private finishTyping(): void {
    this.isTyping = false;
    
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
    
    logger.log('debug', 'DialogBox', '打字完成');
  }

  /**
   * 清空对话框
   */
  clear(): void {
    this.skipTyping();
    
    const speakerEl = this.container.querySelector('.anime-dialog-speaker');
    const textEl = this.container.querySelector('.anime-dialog-text');
    
    if (speakerEl) speakerEl.textContent = '';
    if (textEl) textEl.textContent = '';
  }

  /**
   * 是否正在打字
   */
  isTypingActive(): boolean {
    return this.isTyping;
  }

  /**
   * 设置点击跳过
   */
  enableClickToSkip(): void {
    this.container.addEventListener('click', () => {
      if (this.isTyping) {
        this.skipTyping();
      }
    });
  }

  /**
   * 显示对话（无动画）
   */
  showTextInstant(speaker: string, text: string): void {
    this.skipTyping();
    
    const speakerEl = this.container.querySelector('.anime-dialog-speaker');
    const textEl = this.container.querySelector('.anime-dialog-text');
    
    if (speakerEl) speakerEl.textContent = speaker;
    if (textEl) textEl.textContent = text;
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    this.skipTyping();
    this.container.innerHTML = '';
    logger.log('info', 'DialogBox', '组件已销毁');
  }
}

/**
 * 创建对话框组件的工厂函数
 */
export function createDialogBox(containerId: string): DialogBox {
  return new DialogBox(containerId);
}
