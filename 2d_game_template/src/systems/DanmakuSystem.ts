/**
 * 弹幕人格系统
 * 8个常驻粉丝人格，AI生成个性化弹幕
 */

import { logger } from '../core/DebugLogger';
import { DANMAKU_PERSONALITIES } from '../data/Types';
import type { DanmakuPersonality, PlayerState } from '../data/Types';

export interface DanmakuMessage {
  id: string;
  text: string;
  personalityId: string;
  personalityName: string;
  timestamp: number;
  isGift?: boolean;
  giftAmount?: number;
}

export interface DanmakuGenerationParams {
  scene: string;
  streamerStatus: string;
  todayStats: {
    followers: number;
    failCount: number;
    event?: string;
  };
  historyEvents: string[];
}

/**
 * 8个弹幕人格的详细定义
 */
export const DANMAKU_PERSONALITIES_DETAILED: Record<string, DanmakuPersonality & {
  generateMessage: (params: DanmakuGenerationParams) => string;
  giftChance: number;
}> = {
  laofen: {
    ...DANMAKU_PERSONALITIES.find(p => p.id === 'laofen')!,
    giftChance: 0.1,
    generateMessage: (params) => {
      const oldEvents = params.historyEvents.slice(-3);
      const templates = [
        `我记得你上次${oldEvents[0] || '直播'}也是这样的`,
        `主播又双叒叕翻车了，今日第${params.todayStats.failCount}次`,
        '老粉表示已经习惯了',
        '这波我三年前就见过了',
        `上次说${params.streamerStatus}的时候我就知道你不行`,
        '经典复刻，爷青回'
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }
  },
  heifen: {
    ...DANMAKU_PERSONALITIES.find(p => p.id === 'heifen')!,
    giftChance: 0.3,
    generateMessage: (params) => {
      const templates = [
        '唱得什么玩意儿，但我就爱看这个',
        '主播是不是没活了？咬个打火机吧',
        '这波操作我给0分',
        '退订了...开玩笑的',
        '主播今天状态不行啊',
        '就这？就这？',
        '我是黑粉，但我送了火箭'
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }
  },
  fanyi: {
    ...DANMAKU_PERSONALITIES.find(p => p.id === 'fanyi')!,
    giftChance: 0.05,
    generateMessage: (params) => {
      const templates = [
        '谢主隆恩，吾皇万岁万岁万万岁',
        '主播说：俺也一样',
        '翻译：这波啊，这波是经典复刻',
        '子曰：直播之道，翻车为本',
        '用文言文说：此乃神操作也',
        '英语翻译：This is so funny'
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }
  },
  yanwenzi: {
    ...DANMAKU_PERSONALITIES.find(p => p.id === 'yanwenzi')!,
    giftChance: 0.05,
    generateMessage: () => {
      const emojis = [
        '(๑°o°๑)', '(☆▽☆)', '(；′⌒`)', '(╯°□°）╯',
        '（￣▽￣）', '(｀・ω・´)', '(´；ω；`)', '(✧◡✧)'
      ];
      return emojis[Math.floor(Math.random() * emojis.length)];
    }
  },
  kaoju: {
    ...DANMAKU_PERSONALITIES.find(p => p.id === 'kaoju')!,
    giftChance: 0.1,
    generateMessage: (params) => {
      const templates = [
        `今日翻车${params.todayStats.failCount}次，累计${params.todayStats.failCount * params.todayStats.followers}次`,
        `主播涨粉速度：每小时+${Math.floor(params.todayStats.followers / 24)}`,
        `根据统计，主播有${87 - params.todayStats.failCount * 5}%概率翻车`,
        `当前在线人数：${Math.floor(params.todayStats.followers * 0.1)}`,
        `距离上次翻车已经过去了${Math.floor(Math.random() * 10)}分钟`,
        `主播今日收入预估：${Math.floor(params.todayStats.followers * 0.01)}元`
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }
  },
  nainai: {
    ...DANMAKU_PERSONALITIES.find(p => p.id === 'nainai')!,
    giftChance: 0.2,
    generateMessage: (params) => {
      const templates = [
        '主播怎么哭了？是不是有人欺负你？',
        '奶奶帮你骂他',
        '孩子，要注意身体啊，别太累着',
        '主播吃饭了吗？没吃奶奶给你做',
        '这孩子在说什么呢，奶奶听不懂',
        '主播真可爱，像我家小孙子',
        '别熬夜，早点睡觉'
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }
  },
  gengbaike: {
    ...DANMAKU_PERSONALITIES.find(p => p.id === 'gengbaike')!,
    giftChance: 0.15,
    generateMessage: () => {
      const templates = [
        '这波啊，这波是经典复刻',
        '主播在第五层，我们在第一层',
        'yyds！',
        '绝了，这就是传说中的神操作',
        '名场面预定',
        '弹幕护体！',
        '前方高能预警'
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }
  },
  qianshui: {
    ...DANMAKU_PERSONALITIES.find(p => p.id === 'qianshui')!,
    giftChance: 0.25,
    generateMessage: (params) => {
      const criticalMessages = [
        '主播，你麦克风没关',
        '前方高能',
        '这波我站主播',
        '截图了',
        '录屏已保存',
        '这将会是经典名场面'
      ];
      
      // 潜水员只在关键时刻发言
      if (Math.random() < 0.7) {
        return '...';
      }
      return criticalMessages[Math.floor(Math.random() * criticalMessages.length)];
    }
  }
};

export class DanmakuSystem {
  private messages: DanmakuMessage[] = [];
  private isRunning: boolean = false;
  private generationInterval: number | null = null;
  private historyEvents: string[] = [];
  private readonly MAX_MESSAGES = 50;

  constructor() {
    logger.log('info', 'DanmakuSystem', '弹幕系统初始化完成');
  }

  /**
   * 开始生成弹幕
   */
  start(params: DanmakuGenerationParams, intervalMs: number = 2000): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.log('info', 'DanmakuSystem', '弹幕系统启动');

    this.generationInterval = window.setInterval(() => {
      this.generateBatch(params);
    }, intervalMs);
  }

  /**
   * 停止生成弹幕
   */
  stop(): void {
    this.isRunning = false;
    if (this.generationInterval) {
      clearInterval(this.generationInterval);
      this.generationInterval = null;
    }
    logger.log('info', 'DanmakuSystem', '弹幕系统停止');
  }

  /**
   * 生成一批弹幕（8个人格各一条）
   */
  private generateBatch(params: DanmakuGenerationParams): void {
    const personalities = Object.keys(DANMAKU_PERSONALITIES_DETAILED);
    
    for (const personalityId of personalities) {
      const personality = DANMAKU_PERSONALITIES_DETAILED[personalityId];
      
      // 潜水员只有30%概率发言
      if (personalityId === 'qianshui' && Math.random() > 0.3) {
        continue;
      }

      const message: DanmakuMessage = {
        id: `${Date.now()}_${personalityId}`,
        text: personality.generateMessage(params),
        personalityId,
        personalityName: personality.name,
        timestamp: Date.now(),
        isGift: Math.random() < personality.giftChance,
        giftAmount: Math.random() < personality.giftChance ? Math.floor(Math.random() * 100) : undefined
      };

      this.addMessage(message);
    }
  }

  /**
   * 添加单条弹幕
   */
  addMessage(message: DanmakuMessage): void {
    this.messages.push(message);
    
    // 限制消息数量
    if (this.messages.length > this.MAX_MESSAGES) {
      this.messages.shift();
    }

    logger.log('debug', 'DanmakuSystem', '添加弹幕', { 
      personality: message.personalityName,
      text: message.text.substring(0, 20)
    });
  }

  /**
   * 添加自定义弹幕
   */
  addCustomMessage(text: string, personalityId?: string): void {
    const id = personalityId || 'custom';
    const personality = DANMAKU_PERSONALITIES_DETAILED[id] || {
      name: '观众',
      giftChance: 0
    };

    const message: DanmakuMessage = {
      id: `${Date.now()}_custom`,
      text,
      personalityId: id,
      personalityName: personality.name,
      timestamp: Date.now()
    };

    this.addMessage(message);
  }

  /**
   * 获取所有弹幕
   */
  getMessages(): DanmakuMessage[] {
    return [...this.messages];
  }

  /**
   * 获取最新弹幕
   */
  getLatestMessages(count: number = 10): DanmakuMessage[] {
    return this.messages.slice(-count);
  }

  /**
   * 清空弹幕
   */
  clear(): void {
    this.messages = [];
    logger.log('info', 'DanmakuSystem', '弹幕已清空');
  }

  /**
   * 记录历史事件（用于老粉翻旧账）
   */
  recordEvent(event: string): void {
    this.historyEvents.push(event);
    if (this.historyEvents.length > 20) {
      this.historyEvents.shift();
    }
  }

  /**
   * 获取历史事件
   */
  getHistoryEvents(): string[] {
    return [...this.historyEvents];
  }

  /**
   * 生成AI Prompt（用于调用AI生成弹幕）
   */
  generateAIPrompt(params: DanmakuGenerationParams): string {
    return `
你是一个直播间的弹幕生成器。根据当前直播内容，生成8个不同人格的粉丝弹幕。

当前场景：${params.scene}
主播状态：${params.streamerStatus}
今日数据：粉丝${params.todayStats.followers}，翻车${params.todayStats.failCount}次

8个人格及特征：
1. 老粉阿伟 - 专门翻旧账，会提到之前的翻车
2. 黑粉头子 - 骂人的同时可能打赏
3. 翻译君 - 把主播的话翻译成奇怪语言
4. 颜文字怪 - 只发颜文字
5. 考据党 - 统计数据
6. 奶奶粉 - 温暖但误解梗
7. 梗百科 - 接梗造梗
8. 潜水员 - 平时沉默，关键时刻神评论

请生成8条弹幕，每条标注人格ID，格式：
[人格ID] 弹幕内容
    `.trim();
  }

  /**
   * 解析AI生成的弹幕
   */
  parseAIGeneratedDanmaku(text: string): DanmakuMessage[] {
    const messages: DanmakuMessage[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const match = line.match(/\[(\w+)\]\s*(.+)/);
      if (match) {
        const [, personalityId, content] = match;
        const personality = DANMAKU_PERSONALITIES_DETAILED[personalityId];
        
        if (personality) {
          messages.push({
            id: `${Date.now()}_${personalityId}`,
            text: content.trim(),
            personalityId,
            personalityName: personality.name,
            timestamp: Date.now(),
            isGift: Math.random() < personality.giftChance,
            giftAmount: Math.random() < personality.giftChance ? Math.floor(Math.random() * 100) : undefined
          });
        }
      }
    }

    return messages;
  }

  /**
   * 获取弹幕统计
   */
  getStats(): {
    totalMessages: number;
    byPersonality: Record<string, number>;
    totalGifts: number;
    giftAmount: number;
  } {
    const byPersonality: Record<string, number> = {};
    let totalGifts = 0;
    let giftAmount = 0;

    for (const msg of this.messages) {
      byPersonality[msg.personalityId] = (byPersonality[msg.personalityId] || 0) + 1;
      if (msg.isGift && msg.giftAmount) {
        totalGifts++;
        giftAmount += msg.giftAmount;
      }
    }

    return {
      totalMessages: this.messages.length,
      byPersonality,
      totalGifts,
      giftAmount
    };
  }

  /**
   * 是否正在运行
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * 重置系统
   */
  reset(): void {
    this.stop();
    this.messages = [];
    this.historyEvents = [];
    logger.log('info', 'DanmakuSystem', '弹幕系统已重置');
  }
}

/**
 * 创建弹幕系统的工厂函数
 */
export function createDanmakuSystem(): DanmakuSystem {
  return new DanmakuSystem();
}
