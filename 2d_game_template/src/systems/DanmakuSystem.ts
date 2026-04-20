/**
 * 弹幕人格系统 - 8个常驻粉丝人格
 *
 * 根据设计案第6章：弹幕人格系统
 */

import { DANMAKU_PERSONALITIES } from '../game/GameConfig';
import type { PlayerData } from '../game/PlayerData';

// 辅助函数：格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

export interface DanmakuMessage {
  id: string;
  personalityId: string;
  personalityName: string;
  content: string;
  color: string;
  isSpecial?: boolean;
}

export class DanmakuSystem {
  private playerData: PlayerData;
  private messages: DanmakuMessage[] = [];
  private isRunning = false;
  private messageIdCounter = 0;

  // 每个粉丝的弹幕模板
  private readonly personalityTemplates: Record<string, string[]> = {
    '001': [ // 老粉阿伟
      '我记得你上次也是这么说的',
      '主播又翻车了，第{count}次了',
      '这集我看过，上次也是这样',
      '老粉表示已经习惯了',
      '主播你还记得你说过不再XX吗？',
    ],
    '002': [ // 黑粉头子
      '唱得什么玩意儿',
      '就这？还百大主播？',
      '主播是不是没吃饭',
      '（附赠火箭）虽然骂你但还是要打赏',
      '今天也是来黑主播的一天',
    ],
    '003': [ // 翻译君
      '谢主隆恩，吾皇万岁',
      '启禀陛下，前方高能',
      '遵旨，这就去办',
      '回禀圣上，弹幕已发',
      '吾皇今日龙体安康否？',
    ],
    '004': [ // 颜文字怪
      '(๑°o°๑)',
      '(☆▽☆)',
      '(´；ω；`)',
      '(｀・ω・´)',
      '✧*｡٩(ˊωˋ*)و✧*｡',
    ],
    '005': [ // 考据党
      '今日翻车{count}次，累计{total}次',
      '据统计，主播本月涨粉{followers}',
      '数据更新：PK胜率{rate}%',
      '考据了一下，主播这句话说了{count}遍',
      '今日直播时长{time}分钟，超过{percent}%的主播',
    ],
    '006': [ // 奶奶粉
      '是不是有人欺负你？奶奶帮你',
      '孩子多吃点，别饿着了',
      '主播今天看起来很累啊',
      '奶奶给你送小心心',
      '这孩子，又在熬夜了',
    ],
    '007': [ // 梗百科
      '主播在第五层',
      '这波啊，这波是经典复刻',
      '前方高能，非战斗人员撤离',
      '主播你是不是忘了开美颜',
      '这就是传说中的翻车现场吗',
    ],
    '008': [ // 潜水员
      '主播，你麦克风没关',
      '（突然冒泡）其实我一直都在',
      '看了三年直播，第一次发言',
      '主播你后面有人',
      '（潜水完毕，继续潜水）',
    ],
  };

  constructor(playerData: PlayerData) {
    this.playerData = playerData;
  }

  /**
   * 开始生成弹幕
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.generateInitialMessages();
  }

  /**
   * 停止生成弹幕
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * 获取所有弹幕
   */
  getMessages(): DanmakuMessage[] {
    return [...this.messages];
  }

  /**
   * 生成初始弹幕
   */
  private generateInitialMessages(): void {
    // 每个粉丝先发一条
    DANMAKU_PERSONALITIES.forEach((personality, index) => {
      setTimeout(() => {
        if (this.isRunning) {
          this.addMessage(personality.id);
        }
      }, index * 500);
    });
  }

  /**
   * 添加一条弹幕
   */
  addMessage(personalityId?: string): DanmakuMessage {
    const pid = personalityId || this.getRandomPersonalityId();
    const personality = DANMAKU_PERSONALITIES.find(p => p.id === pid);

    if (!personality) {
      throw new Error(`Unknown personality: ${pid}`);
    }

    const content = this.generateMessageContent(pid);
    const message: DanmakuMessage = {
      id: `msg_${++this.messageIdCounter}`,
      personalityId: pid,
      personalityName: personality.name,
      content,
      color: this.getPersonalityColor(pid),
    };

    this.messages.push(message);

    // 只保留最近50条
    if (this.messages.length > 50) {
      this.messages.shift();
    }

    return message;
  }

  /**
   * 生成弹幕内容
   */
  private generateMessageContent(personalityId: string): string {
    const templates = this.personalityTemplates[personalityId];
    if (!templates || templates.length === 0) {
      return '...';
    }

    let template = templates[Math.floor(Math.random() * templates.length)];

    // 替换变量
    const state = this.playerData.getState();
    template = template.replace('{count}', state.failCount.toString());
    template = template.replace('{total}', (state.failCount + Math.floor(Math.random() * 10)).toString());
    template = template.replace('{followers}', formatNumber(state.followers));
    template = template.replace('{rate}', (50 + Math.floor(Math.random() * 30)).toString());
    template = template.replace('{time}', (60 + Math.floor(Math.random() * 120)).toString());
    template = template.replace('{percent}', (70 + Math.floor(Math.random() * 25)).toString());

    return template;
  }

  /**
   * 获取随机粉丝ID
   */
  private getRandomPersonalityId(): string {
    const index = Math.floor(Math.random() * DANMAKU_PERSONALITIES.length);
    return DANMAKU_PERSONALITIES[index].id;
  }

  /**
   * 获取粉丝颜色
   */
  private getPersonalityColor(personalityId: string): string {
    const colors: Record<string, string> = {
      '001': '#ff6b6b', // 老粉阿伟 - 红色
      '002': '#4ecdc4', // 黑粉头子 - 青色
      '003': '#ffe66d', // 翻译君 - 黄色
      '004': '#ff9ff3', // 颜文字怪 - 粉色
      '005': '#54a0ff', // 考据党 - 蓝色
      '006': '#5f27cd', // 奶奶粉 - 紫色
      '007': '#00d2d3', // 梗百科 - 青绿
      '008': '#8395a7', // 潜水员 - 灰色
    };
    return colors[personalityId] || '#ffffff';
  }

  /**
   * 生成针对特定事件的弹幕
   */
  generateEventReactions(eventType: string): DanmakuMessage[] {
    const reactions: DanmakuMessage[] = [];

    const eventReactions: Record<string, Array<{ pid: string; content: string }>> = {
      'fail': [
        { pid: '001', content: '来了来了，经典翻车' },
        { pid: '005', content: '翻车次数+1，累计{total}次' },
        { pid: '007', content: '这就是传说中的翻车现场' },
      ],
      'success': [
        { pid: '002', content: '今天居然没翻车？' },
        { pid: '006', content: '孩子今天表现真棒' },
        { pid: '007', content: '主播今天超常发挥' },
      ],
      'pk_win': [
        { pid: '001', content: '赢了赢了，不容易啊' },
        { pid: '004', content: '(☆▽☆) 恭喜主播！' },
        { pid: '007', content: '这波操作我给满分' },
      ],
      'pk_lose': [
        { pid: '002', content: '就这？输了吧' },
        { pid: '005', content: 'PK胜率下降至{rate}%' },
        { pid: '008', content: '其实对面确实更强' },
      ],
    };

    const eventReactionList = eventReactions[eventType] || [];

    eventReactionList.forEach(reaction => {
      const personality = DANMAKU_PERSONALITIES.find(p => p.id === reaction.pid);
      if (personality) {
        let content = reaction.content;
        const state = this.playerData.getState();
        content = content.replace('{total}', (state.failCount + Math.floor(Math.random() * 10)).toString());
        content = content.replace('{rate}', (40 + Math.floor(Math.random() * 30)).toString());

        reactions.push({
          id: `msg_${++this.messageIdCounter}`,
          personalityId: reaction.pid,
          personalityName: personality.name,
          content,
          color: this.getPersonalityColor(reaction.pid),
          isSpecial: true,
        });
      }
    });

    this.messages.push(...reactions);
    return reactions;
  }

  /**
   * 清空弹幕
   */
  clear(): void {
    this.messages = [];
    this.messageIdCounter = 0;
  }

  /**
   * 获取特定粉丝的弹幕历史
   */
  getMessagesByPersonality(personalityId: string): DanmakuMessage[] {
    return this.messages.filter(m => m.personalityId === personalityId);
  }
}
