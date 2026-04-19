/**
 * 选项面板组件
 * 显示事件选择选项
 */

import { logger } from '../../core/DebugLogger';
import type { EventChoice } from '../../data/Types';

export interface ChoiceConfig {
  containerId: string;
  choices: EventChoice[];
  onSelect: (choiceId: string) => void;
}

export class ChoicePanel {
  private container: HTMLElement;
  private onSelectCallback?: (choiceId: string) => void;
  private selectedChoice: string | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`容器 #${containerId} 不存在`);
    }
    this.container = container;
    this.init();
    logger.log('info', 'ChoicePanel', '选项面板组件初始化完成');
  }

  /**
   * 初始化组件
   */
  private init(): void {
    this.container.className = 'anime-choice-panel';
  }

  /**
   * 显示选项
   */
  showChoices(choices: EventChoice[], onSelect: (choiceId: string) => void): void {
    this.onSelectCallback = onSelect;
    this.selectedChoice = null;
    
    this.container.innerHTML = '';
    
    choices.forEach((choice, index) => {
      const choiceEl = document.createElement('div');
      choiceEl.className = 'anime-choice-item anime-fade-in';
      choiceEl.style.animationDelay = `${index * 0.1}s`;
      choiceEl.innerHTML = `
        <div class="anime-choice-number">${index + 1}</div>
        <div class="anime-choice-text">${choice.text}</div>
      `;
      
      choiceEl.addEventListener('click', () => this.selectChoice(choice.id, choiceEl));
      
      this.container.appendChild(choiceEl);
    });

    logger.log('info', 'ChoicePanel', '显示选项', { count: choices.length });
  }

  /**
   * 选择选项
   */
  private selectChoice(choiceId: string, element: HTMLElement): void {
    // 移除其他选项的选中状态
    const allChoices = this.container.querySelectorAll('.anime-choice-item');
    allChoices.forEach(el => el.classList.remove('selected'));
    
    // 添加选中状态
    element.classList.add('selected');
    this.selectedChoice = choiceId;

    logger.log('info', 'ChoicePanel', '选择选项', { choiceId });

    // 延迟后触发回调
    setTimeout(() => {
      if (this.onSelectCallback) {
        this.onSelectCallback(choiceId);
      }
    }, 300);
  }

  /**
   * 清空选项
   */
  clear(): void {
    this.container.innerHTML = '';
    this.selectedChoice = null;
  }

  /**
   * 获取当前选中的选项
   */
  getSelectedChoice(): string | null {
    return this.selectedChoice;
  }

  /**
   * 禁用所有选项
   */
  disableAll(): void {
    const allChoices = this.container.querySelectorAll('.anime-choice-item');
    allChoices.forEach(el => {
      (el as HTMLElement).style.pointerEvents = 'none';
      (el as HTMLElement).style.opacity = '0.5';
    });
  }

  /**
   * 启用所有选项
   */
  enableAll(): void {
    const allChoices = this.container.querySelectorAll('.anime-choice-item');
    allChoices.forEach(el => {
      (el as HTMLElement).style.pointerEvents = 'auto';
      (el as HTMLElement).style.opacity = '1';
    });
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    this.clear();
    logger.log('info', 'ChoicePanel', '组件已销毁');
  }
}

/**
 * 创建选项面板组件的工厂函数
 */
export function createChoicePanel(containerId: string): ChoicePanel {
  return new ChoicePanel(containerId);
}
