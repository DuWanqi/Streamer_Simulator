/**
 * 数值面板组件
 * 显示玩家各项数值
 */

import { logger } from '../../core/DebugLogger';
import type { PlayerState } from '../../data/Types';

export interface StatsPanelConfig {
  containerId: string;
}

interface StatItem {
  key: keyof PlayerState;
  label: string;
  icon: string;
  color: string;
}

export class StatsPanel {
  private container: HTMLElement;
  private currentStats: Partial<PlayerState> = {};

  private readonly statConfig: StatItem[] = [
    { key: 'followers', label: '粉丝', icon: '👥', color: '#ffb6c1' },
    { key: 'stamina', label: '体力', icon: '⚡', color: '#87ceeb' },
    { key: 'kindness', label: '善良', icon: '💝', color: '#ff69b4' },
    { key: 'integrity', label: '诚信', icon: '⚖️', color: '#dda0dd' },
    { key: 'money', label: '金钱', icon: '💰', color: '#ffd700' },
    { key: 'sanity', label: '精神', icon: '🧠', color: '#b0e0e6' },
    { key: 'personaIntegrity', label: '人设', icon: '🎭', color: '#e6e6fa' }
  ];

  constructor(config: StatsPanelConfig) {
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`容器 #${config.containerId} 不存在`);
    }
    this.container = container;
    this.init();
    logger.log('info', 'StatsPanel', '数值面板组件初始化完成');
  }

  /**
   * 初始化组件
   */
  private init(): void {
    this.container.className = 'anime-stats-panel';
    this.render();
  }

  /**
   * 渲染面板
   */
  private render(): void {
    this.container.innerHTML = '';
    
    this.statConfig.forEach(stat => {
      const statEl = document.createElement('div');
      statEl.className = 'anime-stat-item';
      statEl.id = `stat-${stat.key}`;
      statEl.innerHTML = `
        <div class="anime-stat-icon">${stat.icon}</div>
        <div class="anime-stat-value" style="color: ${stat.color}">-</div>
        <div class="anime-stat-label">${stat.label}</div>
        <div class="anime-stat-change"></div>
      `;
      this.container.appendChild(statEl);
    });
  }

  /**
   * 更新数值
   */
  updateStats(stats: Partial<PlayerState>): void {
    this.statConfig.forEach(stat => {
      const value = stats[stat.key];
      if (value !== undefined && typeof value === 'number') {
        const oldValue = this.currentStats[stat.key];
        this.updateStatDisplay(stat.key, value, typeof oldValue === 'number' ? oldValue : undefined);
      }
    });

    this.currentStats = { ...this.currentStats, ...stats };
    logger.log('debug', 'StatsPanel', '更新数值', stats);
  }

  /**
   * 更新单个数值显示
   */
  private updateStatDisplay(
    key: string, 
    newValue: number, 
    oldValue?: number
  ): void {
    const statEl = this.container.querySelector(`#stat-${key}`);
    if (!statEl) return;

    const valueEl = statEl.querySelector('.anime-stat-value');
    const changeEl = statEl.querySelector('.anime-stat-change');

    if (valueEl) {
      // 格式化数值
      let displayValue: string;
      if (key === 'followers' && newValue >= 10000) {
        displayValue = (newValue / 10000).toFixed(1) + '万';
      } else {
        displayValue = newValue.toString();
      }
      
      valueEl.textContent = displayValue;

      // 添加变化动画
      if (oldValue !== undefined && oldValue !== newValue) {
        const delta = newValue - oldValue;
        valueEl.classList.remove('anime-number-up', 'anime-number-down');
        
        if (delta > 0) {
          valueEl.classList.add('anime-number-up');
        } else if (delta < 0) {
          valueEl.classList.add('anime-number-down');
        }

        // 显示变化值
        if (changeEl) {
          changeEl.textContent = delta > 0 ? `+${delta}` : `${delta}`;
          changeEl.className = `anime-stat-change ${delta > 0 ? 'up' : 'down'}`;
          
          // 3秒后清除变化显示
          setTimeout(() => {
            changeEl.textContent = '';
          }, 3000);
        }
      }
    }
  }

  /**
   * 显示数值变化
   */
  showChange(statKey: string, delta: number): void {
    const statEl = this.container.querySelector(`#stat-${statKey}`);
    if (!statEl) return;

    const valueEl = statEl.querySelector('.anime-stat-value');
    const changeEl = statEl.querySelector('.anime-stat-change');

    if (valueEl) {
      valueEl.classList.remove('anime-number-up', 'anime-number-down');
      valueEl.classList.add(delta > 0 ? 'anime-number-up' : 'anime-number-down');
    }

    if (changeEl) {
      changeEl.textContent = delta > 0 ? `+${delta}` : `${delta}`;
      changeEl.className = `anime-stat-change ${delta > 0 ? 'up' : 'down'}`;
      
      setTimeout(() => {
        changeEl.textContent = '';
      }, 3000);
    }

    logger.log('debug', 'StatsPanel', '显示数值变化', { statKey, delta });
  }

  /**
   * 高亮特定数值
   */
  highlightStat(statKey: string): void {
    const statEl = this.container.querySelector(`#stat-${statKey}`);
    if (statEl) {
      statEl.classList.add('anime-glow');
      setTimeout(() => {
        statEl.classList.remove('anime-glow');
      }, 1000);
    }
  }

  /**
   * 获取当前数值
   */
  getCurrentStats(): Partial<PlayerState> {
    return { ...this.currentStats };
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    this.container.innerHTML = '';
    logger.log('info', 'StatsPanel', '组件已销毁');
  }
}

/**
 * 创建数值面板组件的工厂函数
 */
export function createStatsPanel(config: StatsPanelConfig): StatsPanel {
  return new StatsPanel(config);
}
