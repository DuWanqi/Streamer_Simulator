/**
 * 游戏日志系统 - 详细记录游戏流程，方便测试和调试
 * 
 * 功能：
 * 1. 记录每日流程（开场、事件、选择、结果）
 * 2. 记录数值变化
 * 3. 记录NPC互动
 * 4. 记录热搜生成
 * 5. 导出日志文件
 * 6. 实时显示在控制台
 */

import type { PlayerData } from '../game/PlayerData';
import type { StoryNode, StoryChoice } from '../events/StoryNodes';
import type { RandomEvent, RandomEventChoice } from '../events/RandomEvents';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 
  | 'SYSTEM' 
  | 'DAILY_FLOW' 
  | 'STORY_EVENT' 
  | 'RANDOM_EVENT' 
  | 'NPC_INTERACTION'
  | 'SURVIVAL'
  | 'HOTSEARCH'
  | 'ENDING'
  | 'STATS_CHANGE';

export interface LogEntry {
  timestamp: string;
  day: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: Record<string, any>;
}

export class GameLogger {
  private static instance: GameLogger;
  private logs: LogEntry[] = [];
  private playerData: PlayerData | null = null;
  private isEnabled: boolean = true;
  private maxLogs: number = 1000;

  // 样式配置
  private readonly styles: Record<LogLevel, string> = {
    debug: 'color: #6b7280',
    info: 'color: #3b82f6',
    warn: 'color: #f59e0b',
    error: 'color: #ef4444; font-weight: bold',
  };

  private readonly categoryEmojis: Record<LogCategory, string> = {
    SYSTEM: '⚙️',
    DAILY_FLOW: '📅',
    STORY_EVENT: '🎭',
    RANDOM_EVENT: '🎲',
    NPC_INTERACTION: '👥',
    SURVIVAL: '💰',
    HOTSEARCH: '🔥',
    ENDING: '🏁',
    STATS_CHANGE: '📊',
  };

  private constructor() {}

  static getInstance(): GameLogger {
    if (!GameLogger.instance) {
      GameLogger.instance = new GameLogger();
    }
    return GameLogger.instance;
  }

  /**
   * 设置PlayerData引用
   */
  setPlayerData(playerData: PlayerData): void {
    this.playerData = playerData;
  }

  /**
   * 启用/禁用日志
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 获取当前天数
   */
  private getCurrentDay(): number {
    return this.playerData?.getState().currentDay || 0;
  }

  /**
   * 记录日志
   */
  log(level: LogLevel, category: LogCategory, message: string, data?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      day: this.getCurrentDay(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 控制台输出
    this.printToConsole(entry);
  }

  /**
   * 打印到控制台
   */
  private printToConsole(entry: LogEntry): void {
    const emoji = this.categoryEmojis[entry.category];
    const time = new Date(entry.timestamp).toLocaleTimeString('zh-CN');
    const style = this.styles[entry.level];
    
    console.log(
      `%c[${time}] ${emoji} [Day ${entry.day}] [${entry.category}] ${entry.message}`,
      style
    );
    
    if (entry.data) {
      console.log('%cData:', 'color: #6b7280; font-style: italic', entry.data);
    }
  }

  // ==================== 便捷方法 ====================

  debug(category: LogCategory, message: string, data?: Record<string, any>): void {
    this.log('debug', category, message, data);
  }

  info(category: LogCategory, message: string, data?: Record<string, any>): void {
    this.log('info', category, message, data);
  }

  warn(category: LogCategory, message: string, data?: Record<string, any>): void {
    this.log('warn', category, message, data);
  }

  error(category: LogCategory, message: string, data?: Record<string, any>): void {
    this.log('error', category, message, data);
  }

  // ==================== 游戏流程日志 ====================

  /**
   * 记录每日开场
   */
  logDailyOpening(day: number, monologue: string, emotion: string): void {
    this.info('DAILY_FLOW', `第${day}天开始`, {
      day,
      monologue,
      emotion,
    });
  }

  /**
   * 记录剧情事件
   */
  logStoryEvent(node: StoryNode): void {
    this.info('STORY_EVENT', `触发剧情节点：${node.name}`, {
      nodeId: node.id,
      nodeName: node.name,
      emotion: node.emotion,
    });
  }

  /**
   * 记录剧情选择
   */
  logStoryChoice(node: StoryNode, choice: StoryChoice): void {
    this.info('STORY_EVENT', `做出选择：${choice.text}`, {
      nodeId: node.id,
      nodeName: node.name,
      choiceId: choice.id,
      choiceText: choice.text,
      effects: choice.effects,
    });
  }

  /**
   * 记录随机事件
   */
  logRandomEvent(event: RandomEvent): void {
    this.info('RANDOM_EVENT', `触发随机事件：${event.name}`, {
      eventId: event.id,
      eventName: event.name,
      category: event.category,
      emotion: event.emotion,
    });
  }

  /**
   * 记录随机事件选择
   */
  logRandomEventChoice(event: RandomEvent, choice: RandomEventChoice): void {
    this.info('RANDOM_EVENT', `做出选择：${choice.text}`, {
      eventId: event.id,
      eventName: event.name,
      choiceId: choice.id,
      choiceText: choice.text,
      effects: choice.effects,
      hotSearchChance: choice.hotSearchChance,
    });
  }

  /**
   * 记录NPC互动
   */
  logNPCInteraction(npcId: string, npcName: string, dialog: string, emotion: string): void {
    this.info('NPC_INTERACTION', `与${npcName}互动`, {
      npcId,
      npcName,
      dialog,
      emotion,
    });
  }

  /**
   * 记录生存状态
   */
  logSurvivalStatus(expenses: Record<string, number>, paid: boolean, crisis?: any): void {
    this.info('SURVIVAL', `每日生存结算`, {
      expenses,
      paid,
      crisis: crisis ? {
        type: crisis.type,
        level: crisis.level,
        message: crisis.message,
      } : null,
    });
  }

  /**
   * 记录热搜生成
   */
  logHotSearch(hotSearch: any): void {
    this.info('HOTSEARCH', `生成热搜：${hotSearch.keyword}`, {
      keyword: hotSearch.keyword,
      heat: hotSearch.heat,
      rank: hotSearch.rank,
      hotComment: hotSearch.hotComment,
    });
  }

  /**
   * 记录结局
   */
  logEnding(ending: any): void {
    this.info('ENDING', `游戏结束：${ending.name}`, {
      type: ending.type,
      name: ending.name,
      description: ending.description,
      truth: ending.truth,
      isGoodEnding: ending.isGoodEnding,
    });
  }

  /**
   * 记录数值变化
   */
  logStatsChange(changes: Record<string, { old: number; new: number; diff: number }>): void {
    const hasChanges = Object.values(changes).some(c => c.diff !== 0);
    if (!hasChanges) return;

    this.info('STATS_CHANGE', '数值变化', changes);
  }

  /**
   * 记录每日总结
   */
  logDailySummary(day: number, stats: any): void {
    this.info('DAILY_FLOW', `第${day}天结束`, {
      day,
      followers: stats.followers,
      income: stats.income,
      sanity: stats.sanity,
      kindness: stats.kindness,
      integrity: stats.integrity,
      failCount: stats.failCount,
    });
  }

  // ==================== 日志导出 ====================

  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 按类别筛选日志
   */
  getLogsByCategory(category: LogCategory): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * 按天数筛选日志
   */
  getLogsByDay(day: number): LogEntry[] {
    return this.logs.filter(log => log.day === day);
  }

  /**
   * 导出为文本
   */
  exportToText(): string {
    const lines: string[] = [];
    lines.push('='.repeat(60));
    lines.push('《主播模拟器：双面人生》游戏日志');
    lines.push(`导出时间：${new Date().toLocaleString('zh-CN')}`);
    lines.push(`总日志数：${this.logs.length}`);
    lines.push('='.repeat(60));
    lines.push('');

    let currentDay = -1;
    for (const log of this.logs) {
      if (log.day !== currentDay) {
        currentDay = log.day;
        lines.push('');
        lines.push(`📅 第 ${log.day} 天`);
        lines.push('-'.repeat(40));
      }

      const time = new Date(log.timestamp).toLocaleTimeString('zh-CN');
      const emoji = this.categoryEmojis[log.category];
      lines.push(`[${time}] ${emoji} [${log.level.toUpperCase()}] ${log.message}`);
      
      if (log.data) {
        const dataStr = JSON.stringify(log.data, null, 2)
          .split('\n')
          .map(line => '    ' + line)
          .join('\n');
        lines.push(dataStr);
      }
    }

    lines.push('');
    lines.push('='.repeat(60));
    lines.push('日志结束');
    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  /**
   * 导出为JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      exportTime: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs,
    }, null, 2);
  }

  /**
   * 下载日志文件
   */
  downloadLogs(format: 'txt' | 'json' = 'txt'): void {
    const content = format === 'json' ? this.exportToJSON() : this.exportToText();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-log-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 清空日志
   */
  clear(): void {
    this.logs = [];
    this.info('SYSTEM', '日志已清空');
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    byDay: Record<number, number>;
  } {
    const byLevel: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0 };
    const byCategory: Record<LogCategory, number> = {
      SYSTEM: 0, DAILY_FLOW: 0, STORY_EVENT: 0, RANDOM_EVENT: 0,
      NPC_INTERACTION: 0, SURVIVAL: 0, HOTSEARCH: 0, ENDING: 0, STATS_CHANGE: 0,
    };
    const byDay: Record<number, number> = {};

    for (const log of this.logs) {
      byLevel[log.level]++;
      byCategory[log.category]++;
      byDay[log.day] = (byDay[log.day] || 0) + 1;
    }

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      byDay,
    };
  }

  /**
   * 打印统计信息到控制台
   */
  printStats(): void {
    const stats = this.getStats();
    console.log('%c=== 游戏日志统计 ===', 'color: #8b5cf6; font-size: 16px; font-weight: bold');
    console.log(`总日志数：${stats.total}`);
    
    console.log('%c按级别：', 'color: #3b82f6; font-weight: bold');
    Object.entries(stats.byLevel).forEach(([level, count]) => {
      console.log(`  ${level}: ${count}`);
    });

    console.log('%c按类别：', 'color: #3b82f6; font-weight: bold');
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`  ${this.categoryEmojis[category as LogCategory]} ${category}: ${count}`);
      }
    });

    console.log('%c按天数：', 'color: #3b82f6; font-weight: bold');
    Object.entries(stats.byDay).forEach(([day, count]) => {
      console.log(`  第${day}天: ${count}条`);
    });
  }
}

// 导出单例
export const gameLogger = GameLogger.getInstance();

// 全局快捷访问（方便在浏览器控制台使用）
if (typeof window !== 'undefined') {
  (window as any).gameLogger = gameLogger;
  (window as any).downloadLogs = () => gameLogger.downloadLogs('txt');
  (window as any).downloadLogsJSON = () => gameLogger.downloadLogs('json');
  (window as any).printLogStats = () => gameLogger.printStats();
}
