/**
 * NPC好感度系统
 * 管理6个NPC的好感度，提供对话和事件触发功能
 */

import { logger } from '../core/DebugLogger';
import type { NPCRelations, NPCId } from '../data/Types';

export interface NPC {
  id: NPCId;
  name: string;
  initialRelation: number;
  firstAppearanceDay: number;
  description: string;
  dialogs: {
    high: string[];    // 好感度高 (>60)
    medium: string[];  // 好感度中 (30-60)
    low: string[];     // 好感度低 (<30)
    zero: string[];    // 好感度为0
  };
}

export const NPCS: Record<NPCId, NPC> = {
  landlady: {
    id: 'landlady',
    name: '房东太太',
    initialRelation: 30,
    firstAppearanceDay: 1,
    description: '包租婆，表面严厉但内心善良',
    dialogs: {
      high: [
        '小爱啊，房租不急，你先照顾好自己。',
        '有什么困难跟阿姨说，别一个人扛着。',
        '你这孩子，总是这么拼，阿姨看着心疼。'
      ],
      medium: [
        '房租记得按时交啊。',
        '最近直播怎么样？还顺利吗？',
        '别太晚睡觉，注意身体。'
      ],
      low: [
        '房租已经拖了好几天了！',
        '我这不是慈善机构！',
        '再这样我只能请你搬走了。'
      ],
      zero: [
        '我不想再看到你。',
        '请你立刻搬走。',
        '我们之间没什么好说的。'
      ]
    }
  },
  kexin: {
    id: 'kexin',
    name: '可心',
    initialRelation: 80,
    firstAppearanceDay: 3,
    description: '室友，工厂女工，性格温柔但命运悲惨',
    dialogs: {
      high: [
        '小爱，有你这个朋友真好。',
        '谢谢你一直陪着我。',
        '不管发生什么，我们都是好朋友。'
      ],
      medium: [
        '今天工作好累啊...',
        '你直播辛苦了，早点休息。',
        '最近厂里事情好多。'
      ],
      low: [
        '我觉得我们越来越远了...',
        '你是不是变了？',
        '或许我该搬走了。'
      ],
      zero: [
        '...',
        '我不想说话。',
        '请你离开。'
      ]
    }
  },
  mom: {
    id: 'mom',
    name: '妈妈',
    initialRelation: 40,
    firstAppearanceDay: 20,
    description: '患有阿尔茨海默症的母亲',
    dialogs: {
      high: [
        '小爱，妈妈为你骄傲。',
        '不管做什么，妈妈都支持你。',
        '回家吧，妈妈想你了。'
      ],
      medium: [
        '最近过得怎么样？',
        '别太累着自己。',
        '记得按时吃饭。'
      ],
      low: [
        '你怎么变成这样了...',
        '妈妈很担心你。',
        '你是不是遇到什么困难了？'
      ],
      zero: [
        '你是谁？',
        '我不认识你...',
        '我的孩子呢？'
      ]
    }
  },
  doudou: {
    id: 'doudou',
    name: '豆豆',
    initialRelation: 0,
    firstAppearanceDay: 6,
    description: '捡到的流浪狗，成为精神慰藉',
    dialogs: {
      high: [
        '汪汪！（开心地摇尾巴）',
        '呜呜~（蹭你的手）',
        '汪！（保护你的姿态）'
      ],
      medium: [
        '汪...（期待的看着你）',
        '呜呜...（有点失落）',
        '汪。（安静地陪伴）'
      ],
      low: [
        '...（躲在一旁）',
        '呜...（害怕的声音）',
        '（不敢靠近）'
      ],
      zero: [
        '（已经不在了）',
        '（空荡荡的狗窝）',
        '（只剩回忆）'
      ]
    }
  },
  yueya: {
    id: 'yueya',
    name: '月牙儿',
    initialRelation: 20,
    firstAppearanceDay: 16,
    description: '竞争对手主播，亦敌亦友',
    dialogs: {
      high: [
        '小爱，我承认你是个值得尊敬的对手。',
        '要不要考虑合作一次？',
        '你的直播很有意思，我学到了不少。'
      ],
      medium: [
        '又是你啊。',
        '今天PK可别输太惨。',
        '你的粉丝挺热情的嘛。'
      ],
      low: [
        '就凭你也想跟我争？',
        '你那些手段真让人恶心。',
        '等着瞧吧。'
      ],
      zero: [
        '我不想再看到你。',
        '滚出我的视线。',
        '你这种人不配做主播。'
      ]
    }
  },
  harasser: {
    id: 'harasser',
    name: '猥琐男',
    initialRelation: 10,
    firstAppearanceDay: 11,
    description: '合租邻居，经常骚扰',
    dialogs: {
      high: [
        '嘿嘿，美女，今天气色不错啊。',
        '要不要来我家坐坐？',
        '你直播我都有在看哦~'
      ],
      medium: [
        '哟，回来了？',
        '一个人住挺寂寞的吧？',
        '我们邻居一场，多交流交流嘛。'
      ],
      low: [
        '装什么清高...',
        '你以为你是谁？',
        '给我等着。'
      ],
      zero: [
        '（不敢再骚扰你）',
        '（看到你绕道走）',
        '（被房东警告后老实了）'
      ]
    }
  }
};

export class NPCSystem {
  private relations: NPCRelations;
  private day: number;

  constructor(initialRelations?: NPCRelations, day: number = 1) {
    this.relations = initialRelations || this.getInitialRelations();
    this.day = day;
    logger.log('info', 'NPCSystem', 'NPC系统初始化完成', { relations: this.relations });
  }

  /**
   * 获取初始好感度
   */
  private getInitialRelations(): NPCRelations {
    return {
      landlady: NPCS.landlady.initialRelation,
      kexin: NPCS.kexin.initialRelation,
      mom: NPCS.mom.initialRelation,
      doudou: NPCS.doudou.initialRelation,
      yueya: NPCS.yueya.initialRelation,
      harasser: NPCS.harasser.initialRelation
    };
  }

  /**
   * 获取指定NPC的好感度
   */
  getRelation(npcId: NPCId): number {
    return this.relations[npcId];
  }

  /**
   * 修改指定NPC的好感度
   */
  modifyRelation(npcId: NPCId, delta: number): void {
    const oldValue = this.relations[npcId];
    this.relations[npcId] = Math.max(0, Math.min(100, oldValue + delta));
    
    logger.log('info', 'NPCSystem', '好感度变化', {
      npc: npcId,
      delta,
      oldValue,
      newValue: this.relations[npcId]
    });
  }

  /**
   * 批量修改好感度
   */
  modifyRelations(effects: Partial<Record<NPCId, number>>): void {
    for (const [npcId, delta] of Object.entries(effects)) {
      if (delta !== undefined) {
        this.modifyRelation(npcId as NPCId, delta);
      }
    }
  }

  /**
   * 获取所有好感度
   */
  getAllRelations(): NPCRelations {
    return { ...this.relations };
  }

  /**
   * 检查好感度是否达到阈值
   */
  checkThreshold(npcId: NPCId, threshold: number): boolean {
    return this.relations[npcId] >= threshold;
  }

  /**
   * 获取NPC对话
   */
  getDialog(npcId: NPCId): string {
    const npc = NPCS[npcId];
    const relation = this.relations[npcId];
    let dialogPool: string[];

    if (relation === 0) {
      dialogPool = npc.dialogs.zero;
    } else if (relation < 30) {
      dialogPool = npc.dialogs.low;
    } else if (relation < 60) {
      dialogPool = npc.dialogs.medium;
    } else {
      dialogPool = npc.dialogs.high;
    }

    return dialogPool[Math.floor(Math.random() * dialogPool.length)];
  }

  /**
   * 检查NPC是否已出现
   */
  hasAppeared(npcId: NPCId): boolean {
    return this.day >= NPCS[npcId].firstAppearanceDay;
  }

  /**
   * 获取已出现的NPC列表
   */
  getAvailableNPCs(): NPCId[] {
    return (Object.keys(NPCS) as NPCId[]).filter(id => this.hasAppeared(id));
  }

  /**
   * 获取NPC信息
   */
  getNPCInfo(npcId: NPCId): NPC {
    return NPCS[npcId];
  }

  /**
   * 检查是否有NPC事件触发
   */
  checkDailyInteraction(): { npcId: NPCId; type: 'dialog' | 'event' } | null {
    const availableNPCs = this.getAvailableNPCs();
    
    // 检查是否有特殊事件触发
    for (const npcId of availableNPCs) {
      const relation = this.relations[npcId];
      
      // 房东太太：好感度0且拖欠房租超过7天，触发驱逐事件
      if (npcId === 'landlady' && relation === 0) {
        return { npcId, type: 'event' };
      }
      
      // 猥琐男：好感度低于20，可能触发骚扰事件
      if (npcId === 'harasser' && relation < 20 && Math.random() < 0.3) {
        return { npcId, type: 'event' };
      }
    }

    // 30%概率触发普通对话
    if (Math.random() < 0.3 && availableNPCs.length > 0) {
      const randomNPC = availableNPCs[Math.floor(Math.random() * availableNPCs.length)];
      return { npcId: randomNPC, type: 'dialog' };
    }

    return null;
  }

  /**
   * 设置当前天数
   */
  setDay(day: number): void {
    this.day = day;
  }

  /**
   * 获取当前天数
   */
  getDay(): number {
    return this.day;
  }

  /**
   * 检查结局条件
   */
  checkEndingConditions(): {
    allHigh: boolean;
    allLow: boolean;
    landladyZero: boolean;
    kexinHigh: boolean;
    momHigh: boolean;
    doudouHigh: boolean;
  } {
    return {
      allHigh: Object.values(this.relations).every(r => r >= 60),
      allLow: Object.values(this.relations).every(r => r <= 30),
      landladyZero: this.relations.landlady === 0,
      kexinHigh: this.relations.kexin >= 60,
      momHigh: this.relations.mom >= 60,
      doudouHigh: this.relations.doudou >= 60
    };
  }
}

/**
 * 创建NPC系统的工厂函数
 */
export function createNPCSystem(initialRelations?: NPCRelations, day?: number): NPCSystem {
  return new NPCSystem(initialRelations, day);
}
