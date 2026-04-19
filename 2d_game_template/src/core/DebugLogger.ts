/**
 * 调试日志系统
 * 提供分级日志、模块分类、性能监控、日志导出功能
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface DebugLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  performance?: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
}

export class DebugLogger {
  private static instance: DebugLogger;
  private logs: DebugLog[] = [];
  private isEnabled: boolean = true;
  private maxLogs: number = 1000;
  private performanceMarks: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  /**
   * 记录日志
   */
  log(
    level: LogLevel,
    module: string,
    message: string,
    data?: any
  ): void {
    if (!this.isEnabled) return;

    const log: DebugLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level,
      module,
      message,
      data: data ? this.safeClone(data) : undefined
    };

    this.logs.push(log);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 控制台输出
    this.outputToConsole(log);
  }

  /**
   * 快捷方法
   */
  info(module: string, message: string, data?: any): void {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: any): void {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, data?: any): void {
    this.log('error', module, message, data);
  }

  debug(module: string, message: string, data?: any): void {
    this.log('debug', module, message, data);
  }

  /**
   * 开始性能计时
   */
  startPerformanceMark(markName: string): void {
    this.performanceMarks.set(markName, performance.now());
  }

  /**
   * 结束性能计时并记录
   */
  endPerformanceMark(markName: string, module: string, message: string): void {
    const startTime = this.performanceMarks.get(markName);
    if (!startTime) {
      this.warn('DebugLogger', `Performance mark "${markName}" not found`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.log('info', module, message, {
      markName,
      duration: `${duration.toFixed(2)}ms`
    });

    this.performanceMarks.delete(markName);
  }

  /**
   * 获取所有日志
   */
  getLogs(filter?: {
    level?: LogLevel;
    module?: string;
    startTime?: number;
    endTime?: number;
  }): DebugLog[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.module) {
      filtered = filtered.filter(log => log.module === filter.module);
    }

    if (filter?.startTime) {
      filtered = filtered.filter(log => log.timestamp >= filter.startTime!);
    }

    if (filter?.endTime) {
      filtered = filtered.filter(log => log.timestamp <= filter.endTime!);
    }

    return filtered;
  }

  /**
   * 导出日志为JSON字符串
   */
  exportLogs(): string {
    const exportData = {
      exportTime: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 下载日志文件
   */
  downloadLogs(filename?: string): void {
    const data = this.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `game-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    this.logs = [];
    this.info('DebugLogger', 'Logs cleared');
  }

  /**
   * 启用/禁用日志
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byModule: Record<string, number>;
  } {
    const byLevel: Record<LogLevel, number> = {
      info: 0,
      warn: 0,
      error: 0,
      debug: 0
    };

    const byModule: Record<string, number> = {};

    this.logs.forEach(log => {
      byLevel[log.level]++;
      byModule[log.module] = (byModule[log.module] || 0) + 1;
    });

    return {
      total: this.logs.length,
      byLevel,
      byModule
    };
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 安全克隆对象（避免循环引用）
   */
  private safeClone(obj: any): any {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return '[Circular or Non-serializable]';
    }
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(log: DebugLog): void {
    const time = new Date(log.timestamp).toLocaleTimeString();
    const prefix = `[${time}] [${log.level.toUpperCase()}] [${log.module}]`;

    switch (log.level) {
      case 'info':
        console.log(prefix, log.message, log.data || '');
        break;
      case 'warn':
        console.warn(prefix, log.message, log.data || '');
        break;
      case 'error':
        console.error(prefix, log.message, log.data || '');
        break;
      case 'debug':
        console.debug(prefix, log.message, log.data || '');
        break;
    }
  }
}

// 全局快捷访问
export const logger = DebugLogger.getInstance();
