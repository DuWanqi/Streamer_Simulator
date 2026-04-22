/**
 * 过场动画系统 - CutsceneSystem
 * 
 * 一个解耦的、通用的过场动画播放系统
 * 支持：漫画图片、文字幕卡、视频、背景音效
 * 提供流畅的过渡动画和艺术化的视觉效果
 */

export type CutsceneElementType = 'image' | 'text' | 'video' | 'audio';

export interface CutsceneElement {
  type: CutsceneElementType;
  duration: number; // 毫秒，0表示等待用户点击
  transition?: {
    in: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'none';
    out: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'none';
    duration: number;
  };
}

export interface ImageElement extends CutsceneElement {
  type: 'image';
  src: string;
  fit?: 'contain' | 'cover' | 'fill';
  effect?: 'ken-burns' | 'pulse' | 'none';
}

export interface TextElement extends CutsceneElement {
  type: 'text';
  content: string;
  subContent?: string;
  typingEffect?: boolean;
  typingSpeed?: number;
  align?: 'left' | 'center';
}

export interface VideoElement extends CutsceneElement {
  type: 'video';
  src: string;
  autoplay: boolean;
  loop?: boolean;
}

export interface AudioElement extends CutsceneElement {
  type: 'audio';
  src: string;
  volume?: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

export type CutsceneSequence = (ImageElement | TextElement | VideoElement | AudioElement)[];

export interface CutsceneConfig {
  sequence: CutsceneSequence;
  backgroundColor?: string;
  allowSkip?: boolean;
  autoAdvance?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export class CutsceneSystem {
  private container: HTMLElement | null = null;
  private currentIndex = 0;
  private config: CutsceneConfig | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;
  private skipButton: HTMLElement | null = null;
  private clickHandler: (() => void) | null = null;

  constructor() {
    this.handleClick = this.handleClick.bind(this);
    this.handleSkip = this.handleSkip.bind(this);
  }

  /**
   * 播放过场动画序列
   */
  public async play(config: CutsceneConfig): Promise<void> {
    return new Promise((resolve) => {
      this.config = {
        backgroundColor: '#000000',
        allowSkip: true,
        autoAdvance: true,
        ...config,
      };

      // 包装 onComplete 以 resolve Promise
      const originalOnComplete = this.config.onComplete;
      this.config.onComplete = () => {
        originalOnComplete?.();
        resolve();
      };

      this.currentIndex = 0;
      this.createContainer();
      this.isPlaying = true;
      this.playCurrentElement();
    });
  }

  /**
   * 创建过场动画容器
   */
  private createContainer(): void {
    // 移除已存在的容器
    this.destroy();

    this.container = document.createElement('div');
    this.container.id = 'cutscene-container';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: ${this.config!.backgroundColor};
      z-index: 9999;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // 添加点击事件（用于手动推进）
    this.clickHandler = this.handleClick;
    this.container.addEventListener('click', this.clickHandler);

    // 添加跳过按钮
    if (this.config!.allowSkip) {
      this.createSkipButton();
    }

    // 添加全局样式
    this.injectStyles();

    document.body.appendChild(this.container);
  }

  /**
   * 创建跳过按钮
   */
  private createSkipButton(): void {
    this.skipButton = document.createElement('button');
    this.skipButton.id = 'cutscene-skip-btn';
    this.skipButton.textContent = '跳过';
    this.skipButton.style.cssText = `
      position: absolute;
      top: 30px;
      right: 30px;
      padding: 10px 24px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10000;
      font-family: 'Noto Sans SC', sans-serif;
      backdrop-filter: blur(10px);
    `;

    this.skipButton.addEventListener('mouseenter', () => {
      this.skipButton!.style.background = 'rgba(255, 255, 255, 0.2)';
      this.skipButton!.style.color = 'rgba(255, 255, 255, 0.9)';
    });

    this.skipButton.addEventListener('mouseleave', () => {
      this.skipButton!.style.background = 'rgba(255, 255, 255, 0.1)';
      this.skipButton!.style.color = 'rgba(255, 255, 255, 0.6)';
    });

    this.skipButton.addEventListener('click', this.handleSkip);
    this.container!.appendChild(this.skipButton);
  }

  /**
   * 注入全局样式
   */
  private injectStyles(): void {
    if (document.getElementById('cutscene-styles')) return;

    const style = document.createElement('style');
    style.id = 'cutscene-styles';
    style.textContent = `
      @keyframes cutscene-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes cutscene-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @keyframes cutscene-slide-up-in {
        from { opacity: 0; transform: translateY(60px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes cutscene-slide-up-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-60px); }
      }

      @keyframes cutscene-slide-down-in {
        from { opacity: 0; transform: translateY(-60px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes cutscene-slide-down-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(60px); }
      }

      @keyframes cutscene-scale-in {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }

      @keyframes cutscene-scale-out {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(1.1); }
      }

      @keyframes cutscene-ken-burns {
        0% { transform: scale(1) translate(0, 0); }
        50% { transform: scale(1.08) translate(-1%, -1%); }
        100% { transform: scale(1) translate(0, 0); }
      }

      @keyframes cutscene-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }

      @keyframes cutscene-typing-cursor {
        0%, 100% { border-color: transparent; }
        50% { border-color: rgba(255, 255, 255, 0.8); }
      }

      .cutscene-element {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cutscene-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .cutscene-image.ken-burns {
        animation: cutscene-ken-burns 20s ease-in-out infinite;
      }

      .cutscene-image.pulse {
        animation: cutscene-pulse 4s ease-in-out infinite;
      }

      .cutscene-text-container {
        max-width: 800px;
        padding: 60px;
        text-align: center;
      }

      .cutscene-text-main {
        font-size: 2.2rem;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.8;
        margin-bottom: 30px;
        font-family: 'Noto Sans SC', sans-serif;
        letter-spacing: 0.05em;
      }

      .cutscene-text-sub {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.9;
        font-family: 'Noto Sans SC', sans-serif;
      }

      .cutscene-text-typing::after {
        content: '';
        border-right: 2px solid rgba(255, 255, 255, 0.8);
        animation: cutscene-typing-cursor 0.8s infinite;
      }

      .cutscene-progress {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        z-index: 10000;
      }

      .cutscene-progress-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
      }

      .cutscene-progress-dot.active {
        background: rgba(255, 255, 255, 0.9);
        transform: scale(1.3);
      }

      .cutscene-hint {
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 13px;
        color: rgba(255, 255, 255, 0.3);
        font-family: 'Noto Sans SC', sans-serif;
        animation: cutscene-fade-in 1s ease-out 2s both;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 播放当前元素
   */
  private async playCurrentElement(): Promise<void> {
    if (!this.isPlaying || !this.config || this.currentIndex >= this.config.sequence.length) {
      this.complete();
      return;
    }

    const element = this.config.sequence[this.currentIndex];
    
    // 更新进度指示器
    this.updateProgressIndicator();

    try {
      // 根据类型播放
      switch (element.type) {
        case 'image':
          await this.playImageElement(element as ImageElement);
          break;
        case 'text':
          await this.playTextElement(element as TextElement);
          break;
        case 'video':
          await this.playVideoElement(element as VideoElement);
          break;
        case 'audio':
          await this.playAudioElement(element as AudioElement);
          break;
        default:
          console.warn('[CutsceneSystem] 未知的元素类型');
          this.nextElement();
      }
    } catch (error) {
      console.error('[CutsceneSystem] 播放元素失败:', error);
      this.nextElement();
    }
  }

  /**
   * 播放图片元素
   */
  private async playImageElement(element: ImageElement): Promise<void> {
    const wrapper = document.createElement('div');
    wrapper.className = 'cutscene-element';
    wrapper.style.opacity = '0'; // 初始隐藏，等待加载完成
    
    const img = document.createElement('img');
    img.className = 'cutscene-image';
    
    if (element.effect === 'ken-burns') {
      img.classList.add('ken-burns');
    } else if (element.effect === 'pulse') {
      img.classList.add('pulse');
    }

    // 等待图片加载完成
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`[CutsceneSystem] 图片加载失败: ${element.src}`);
        resolve(); // 即使加载失败也继续
      };
      img.src = element.src;
    });

    // 设置过渡动画
    const transitionIn = element.transition?.in || 'fade';
    const duration = element.transition?.duration || 800;
    
    wrapper.style.opacity = '1';
    wrapper.style.animation = `cutscene-${transitionIn}-in ${duration}ms ease-out`;
    wrapper.appendChild(img);
    this.container!.appendChild(wrapper);

    // 等待显示时间
    if (element.duration > 0 && this.config!.autoAdvance) {
      await this.delay(element.duration);
      
      // 淡出
      const transitionOut = element.transition?.out || 'fade';
      wrapper.style.animation = `cutscene-${transitionOut}-out ${duration}ms ease-in`;
      await this.delay(duration);
      wrapper.remove();
      
      this.nextElement();
    }
  }

  /**
   * 播放文字元素（黑屏白字）
   */
  private async playTextElement(element: TextElement): Promise<void> {
    const wrapper = document.createElement('div');
    wrapper.className = 'cutscene-element';
    wrapper.style.backgroundColor = '#000000';

    const container = document.createElement('div');
    container.className = 'cutscene-text-container';

    const mainText = document.createElement('div');
    mainText.className = 'cutscene-text-main';
    
    if (element.typingEffect !== false) {
      mainText.classList.add('cutscene-text-typing');
    }

    container.appendChild(mainText);

    // 副标题
    if (element.subContent) {
      const subText = document.createElement('div');
      subText.className = 'cutscene-text-sub';
      subText.textContent = element.subContent;
      container.appendChild(subText);
    }

    wrapper.appendChild(container);
    this.container!.appendChild(wrapper);

    // 打字机效果
    if (element.typingEffect !== false) {
      await this.typeText(mainText, element.content, element.typingSpeed || 60);
    } else {
      mainText.textContent = element.content;
    }

    // 等待时间或点击
    if (element.duration > 0 && this.config!.autoAdvance) {
      await this.delay(element.duration);
      
      const transitionOut = element.transition?.out || 'fade';
      const duration = element.transition?.duration || 600;
      wrapper.style.animation = `cutscene-${transitionOut}-out ${duration}ms ease-in`;
      await this.delay(duration);
      wrapper.remove();
      
      this.nextElement();
    }
  }

  /**
   * 打字机效果
   */
  private async typeText(element: HTMLElement, text: string, speed: number): Promise<void> {
    return new Promise((resolve) => {
      let index = 0;
      element.textContent = '';
      
      const type = () => {
        if (index < text.length) {
          element.textContent += text[index];
          index++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      };
      
      type();
    });
  }

  /**
   * 播放视频元素
   */
  private async playVideoElement(element: VideoElement): Promise<void> {
    const wrapper = document.createElement('div');
    wrapper.className = 'cutscene-element';

    const video = document.createElement('video');
    video.src = element.src;
    video.autoplay = element.autoplay;
    video.loop = element.loop || false;
    video.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain;';

    wrapper.appendChild(video);
    this.container!.appendChild(wrapper);

    if (element.autoplay) {
      await video.play();
    }

    // 等待播放完成或指定时间
    if (element.duration > 0) {
      await this.delay(element.duration);
      video.pause();
      wrapper.remove();
      this.nextElement();
    }
  }

  /**
   * 播放音频元素
   */
  private async playAudioElement(element: AudioElement): Promise<void> {
    this.audioElement = new Audio(element.src);
    this.audioElement.volume = element.volume || 1;
    this.audioElement.loop = element.loop || false;

    // 淡入
    if (element.fadeIn) {
      this.audioElement.volume = 0;
      this.audioElement.play();
      await this.fadeAudio(this.audioElement, element.volume || 1, element.fadeIn);
    } else {
      this.audioElement.play();
    }

    // 音频不阻塞，直接继续
    this.nextElement();
  }

  /**
   * 音频淡入淡出
   */
  private async fadeAudio(audio: HTMLAudioElement, targetVolume: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startVolume = audio.volume;
      const startTime = Date.now();
      
      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = startVolume + (targetVolume - startVolume) * progress;
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };
      
      fade();
    });
  }

  /**
   * 更新进度指示器
   */
  private updateProgressIndicator(): void {
    // 移除旧的指示器
    const oldIndicator = this.container!.querySelector('.cutscene-progress');
    if (oldIndicator) oldIndicator.remove();

    const indicator = document.createElement('div');
    indicator.className = 'cutscene-progress';

    this.config!.sequence.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `cutscene-progress-dot ${index === this.currentIndex ? 'active' : ''}`;
      indicator.appendChild(dot);
    });

    this.container!.appendChild(indicator);

    // 添加点击提示
    if (!this.container!.querySelector('.cutscene-hint')) {
      const hint = document.createElement('div');
      hint.className = 'cutscene-hint';
      hint.textContent = '点击屏幕继续';
      this.container!.appendChild(hint);
    }
  }

  /**
   * 处理点击事件
   */
  private handleClick(): void {
    if (!this.isPlaying) return;

    const element = this.config!.sequence[this.currentIndex];
    
    // 如果当前元素是等待点击的（duration为0），则推进
    if (element.duration === 0) {
      this.removeCurrentElement();
      this.nextElement();
    }
  }

  /**
   * 移除当前元素
   */
  private removeCurrentElement(): void {
    const elements = this.container!.querySelectorAll('.cutscene-element');
    elements.forEach(el => el.remove());
  }

  /**
   * 进入下一个元素
   */
  private nextElement(): void {
    this.currentIndex++;
    this.playCurrentElement();
  }

  /**
   * 处理跳过
   */
  private handleSkip(e: Event): void {
    e.stopPropagation();
    this.config?.onSkip?.();
    this.complete();
  }

  /**
   * 完成播放
   */
  private complete(): void {
    this.isPlaying = false;
    this.config?.onComplete?.();
    this.destroy();
  }

  /**
   * 销毁系统
   */
  public destroy(): void {
    // 停止音频
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }

    // 移除容器
    if (this.container) {
      if (this.clickHandler) {
        this.container.removeEventListener('click', this.clickHandler);
      }
      this.container.remove();
      this.container = null;
    }

    this.isPlaying = false;
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例
export const cutsceneSystem = new CutsceneSystem();
