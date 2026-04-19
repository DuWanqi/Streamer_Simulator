/**
 * 热搜卡片组件
 * 显示微博风格热搜
 */

import { logger } from '../../core/DebugLogger';
import type { HotSearch } from '../../data/Types';

export interface HotSearchCardConfig {
  containerId: string;
}

export class HotSearchCard {
  private container: HTMLElement;

  constructor(config: HotSearchCardConfig) {
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`容器 #${config.containerId} 不存在`);
    }
    this.container = container;
    this.init();
    logger.log('info', 'HotSearchCard', '热搜卡片组件初始化完成');
  }

  /**
   * 初始化组件
   */
  private init(): void {
    this.container.className = 'anime-hotsearch-card';
    this.container.style.display = 'none';
  }

  /**
   * 显示热搜
   */
  show(hotSearch: HotSearch): void {
    this.container.style.display = 'block';
    this.container.classList.add('anime-fade-in');
    
    this.container.innerHTML = `
      <div class="anime-hotsearch-keyword">${hotSearch.keyword}</div>
      <div class="anime-hotsearch-heat">🔥 ${hotSearch.heat}</div>
      <div class="anime-hotsearch-comment">"${hotSearch.hotComment}"</div>
    `;

    // 添加热度数字动画
    setTimeout(() => {
      const heatEl = this.container.querySelector('.anime-hotsearch-heat');
      if (heatEl) {
        heatEl.classList.add('anime-pulse');
      }
    }, 100);

    logger.log('info', 'HotSearchCard', '显示热搜', { 
      keyword: hotSearch.keyword,
      heat: hotSearch.heat 
    });
  }

  /**
   * 显示多个热搜
   */
  showMultiple(hotSearches: HotSearch[]): void {
    if (hotSearches.length === 0) {
      this.hide();
      return;
    }

    this.container.style.display = 'block';
    this.container.innerHTML = '<div class="hotsearch-list"></div>';
    
    const listEl = this.container.querySelector('.hotsearch-list');
    if (!listEl) return;

    hotSearches.forEach((hotSearch, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'anime-hotsearch-card anime-fade-in';
      cardEl.style.animationDelay = `${index * 0.2}s`;
      cardEl.style.marginBottom = '12px';
      cardEl.innerHTML = `
        <div class="anime-hotsearch-keyword">${hotSearch.keyword}</div>
        <div class="anime-hotsearch-heat">🔥 ${hotSearch.heat}</div>
        <div class="anime-hotsearch-comment">"${hotSearch.hotComment}"</div>
      `;
      listEl.appendChild(cardEl);
    });

    logger.log('info', 'HotSearchCard', '显示多个热搜', { count: hotSearches.length });
  }

  /**
   * 隐藏热搜
   */
  hide(): void {
    this.container.style.display = 'none';
    this.container.innerHTML = '';
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    this.hide();
    logger.log('info', 'HotSearchCard', '组件已销毁');
  }
}

/**
 * 创建热搜卡片组件的工厂函数
 */
export function createHotSearchCard(config: HotSearchCardConfig): HotSearchCard {
  return new HotSearchCard(config);
}
