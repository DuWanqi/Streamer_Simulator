/**
 * 结局系统
 * 5种结局判定与生成
 */

import { logger } from '../core/DebugLogger';
import type { PlayerState, NPCId } from '../data/Types';
import { NPCS } from './NPCSystem';

export type EndingType = 
  | 'self_reconciliation'  // 结局一：自我和解
  | 'lost_in_virtual'      // 结局二：困于虚拟
  | 'escape_reality'       // 结局三：逃离网络
  | 'total_collapse'       // 结局四：双向崩塌
  | 'truth_revealed';      // 结局五：真相大白

export interface Ending {
  id: EndingType;
  name: string;
  title: string;
  description: string;
  story: string;
  epilogue: string;
  condition: string;
  unlockHint: string;
}

export class EndingSystem {
  constructor() {
    logger.log('info', 'EndingSystem', '结局系统初始化完成');
  }

  /**
   * 判定结局
   * 优先级：结局五 > 结局四 > 结局二 > 结局三 > 结局一
   */
  determineEnding(
    state: PlayerState,
    triggeredEvents: string[],
    storyChoices: Record<string, string>
  ): Ending {
    // 结局五：真相大白（完美结局）
    if (this.checkEnding5(state)) {
      return this.getEnding('truth_revealed');
    }

    // 结局四：双向崩塌（失败结局）
    if (this.checkEnding4(state)) {
      return this.getEnding('total_collapse');
    }

    // 结局二：困于虚拟（悲剧结局）
    if (this.checkEnding2(state)) {
      return this.getEnding('lost_in_virtual');
    }

    // 结局三：逃离网络（中性结局）
    if (this.checkEnding3(state)) {
      return this.getEnding('escape_reality');
    }

    // 结局一：自我和解（默认结局）
    return this.getEnding('self_reconciliation');
  }

  /**
   * 检查结局五：真相大白
   * 条件：善良值≥70，诚信值≥70，所有NPC好感度≥60
   */
  private checkEnding5(state: PlayerState): boolean {
    const { kindness, integrity, npcRelations } = state;
    const allNPCsHigh = Object.values(npcRelations).every(r => r >= 60);
    
    return kindness >= 70 && integrity >= 70 && allNPCsHigh;
  }

  /**
   * 检查结局四：双向崩塌
   * 条件：经济值≤-1000，房东太太好感度=0
   */
  private checkEnding4(state: PlayerState): boolean {
    const { money, npcRelations } = state;
    
    return money <= -1000 && npcRelations.landlady === 0;
  }

  /**
   * 检查结局二：困于虚拟
   * 条件：善良值≤40，诚信值≤40，人设完整度<30
   */
  private checkEnding2(state: PlayerState): boolean {
    const { kindness, integrity, personaIntegrity, npcRelations } = state;
    const keyNPCsLow = npcRelations.mom <= 30 && npcRelations.kexin <= 30 && npcRelations.doudou <= 30;
    
    return kindness <= 40 && integrity <= 40 && personaIntegrity < 30 && keyNPCsLow;
  }

  /**
   * 检查结局三：逃离网络
   * 条件：精神值<20，或遭遇严重网暴后选择放弃
   */
  private checkEnding3(state: PlayerState): boolean {
    const { sanity } = state;
    
    return sanity < 20;
  }

  /**
   * 获取结局详情
   */
  getEnding(type: EndingType): Ending {
    const endings: Record<EndingType, Ending> = {
      self_reconciliation: {
        id: 'self_reconciliation',
        name: '结局一：自我和解',
        title: '回归本真',
        description: '偏圆满结局',
        story: `暂停直播，回老家陪伴妈妈，关掉虚拟形象。

粉丝反而更喜欢真实的你。妈妈病情稳定，豆豆陪伴，月牙儿成为朋友。

你终于明白：互联网身份只是一部分，真正的身份认同是接纳现实中的自己。`,
        epilogue: `停播100天后，你带着真实的自我回归。

直播间里，你不再刻意表演，而是分享真实的生活。

粉丝们说："这样的小爱，我们更喜欢。"

你在虚拟与现实之间，找到了属于自己的平衡。`,
        condition: '善良值≥60，诚信值≥60，妈妈/豆豆/可心好感度≥60',
        unlockHint: '保持善良和诚信，维护好与NPC的关系'
      },

      lost_in_virtual: {
        id: 'lost_in_virtual',
        name: '结局二：困于虚拟',
        title: '彻底迷失',
        description: '偏悲剧结局',
        story: `成为顶级大博主，拥有千万粉丝和巨额财富。

但失去所有现实牵挂——妈妈彻底失忆，可心、豆豆淡出生活，月牙儿敌对。

深夜坐在豪华公寓里倍感孤独，你活成了互联网的傀儡。`,
        epilogue: `停播100天后，你试图回归现实，却发现已经回不去了。

那些曾经的温暖，都已经远去。

你拥有了想要的一切，却失去了最重要的东西——真实的自我。

最终，你选择了永远留在虚拟世界里。`,
        condition: '善良值≤40，诚信值≤40，人设完整度<30',
        unlockHint: '做出自私的选择，忽视NPC关系，维持虚假人设'
      },

      escape_reality: {
        id: 'escape_reality',
        name: '结局三：逃离网络',
        title: '回归现实',
        description: '中性结局',
        story: `意识到网络光鲜都是虚无，现实的温暖才是真的。

停播100天里彻底告别主播身份，删除账号，回老家找稳定工作。

陪伴家人，回归平淡却真实的现实生活。`,
        epilogue: `你成为了一名普通的上班族，每天朝九晚五。

偶尔想起直播的日子，像一场遥远的梦。

但你知道，这才是你想要的生活。

真实的平淡，胜过虚拟的繁华。`,
        condition: '精神值<20，或遭遇严重网暴后选择放弃',
        unlockHint: '让精神值降到极低，或在网暴事件中选择退网'
      },

      total_collapse: {
        id: 'total_collapse',
        name: '结局四：双向崩塌',
        title: '彻底沉寂',
        description: '失败结局',
        story: `被赶出出租屋，经济破产，设备被变卖，人气归零。

所有人物淡出生活，无法继续直播，也无力回家面对妈妈。

重新沦为无人问津的普通人。`,
        epilogue: `停播100天后，你试图重新开始，但已经没有人记得你了。

互联网的记忆是短暂的，你的故事很快被遗忘。

你明白了：在这个时代，没有流量，就没有存在。

但你也学会了，如何做一个普通人。`,
        condition: '经济值≤-1000，房东太太好感度=0',
        unlockHint: '让经济破产，同时与房东太太关系恶化到极点'
      },

      truth_revealed: {
        id: 'truth_revealed',
        name: '结局五：真相大白',
        title: '双向救赎',
        description: '完美结局',
        story: `妥善处理所有矛盾，用真诚收获现实认可与网络喜爱。

停播100天真相揭晓：你并非遭遇意外，而是在两种身份的挣扎中选择暂停，寻找真实自我。

最终带着粉丝理解和现实温暖回归。`,
        epilogue: `你用真实自我直播，实现了双向救赎。

粉丝们理解了你的停播，家人支持你的选择。

你证明了：虚拟与现实并不矛盾，关键在于保持真实。

这是最好的结局——你找到了真正的自己。`,
        condition: '善良值≥70，诚信值≥70，所有NPC好感度≥60',
        unlockHint: '保持极高的善良和诚信，与所有NPC建立良好关系'
      }
    };

    return endings[type];
  }

  /**
   * 获取所有结局
   */
  getAllEndings(): Ending[] {
    const types: EndingType[] = [
      'self_reconciliation',
      'lost_in_virtual',
      'escape_reality',
      'total_collapse',
      'truth_revealed'
    ];
    return types.map(type => this.getEnding(type));
  }

  /**
   * 获取结局解锁条件
   */
  getEndingConditions(): Record<EndingType, string> {
    return {
      self_reconciliation: '善良值≥60，诚信值≥60，妈妈/豆豆/可心好感度≥60',
      lost_in_virtual: '善良值≤40，诚信值≤40，人设完整度<30',
      escape_reality: '精神值<20，或遭遇严重网暴后选择放弃',
      total_collapse: '经济值≤-1000，房东太太好感度=0',
      truth_revealed: '善良值≥70，诚信值≥70，所有NPC好感度≥60'
    };
  }

  /**
   * 生成结局展示文本
   */
  generateEndingText(
    ending: Ending,
    state: PlayerState,
    npcRelations: Record<NPCId, number>
  ): string {
    const npcStatus = Object.entries(npcRelations)
      .map(([id, value]) => {
        const npc = NPCS[id as NPCId];
        let status = '';
        if (value >= 80) status = '（挚友）';
        else if (value >= 60) status = '（好友）';
        else if (value >= 30) status = '（普通）';
        else if (value > 0) status = '（冷淡）';
        else status = '（敌对）';
        return `${npc.name}: ${value}${status}`;
      })
      .join('\n');

    return `
${ending.name}
${'='.repeat(40)}

${ending.story}

最终状态：
- 粉丝数：${state.followers.toLocaleString()}
- 善良值：${state.kindness}
- 诚信值：${state.integrity}
- 精神值：${state.sanity}
- 人设完整度：${state.personaIntegrity}

NPC关系：
${npcStatus}

${ending.epilogue}
    `.trim();
  }

  /**
   * 生成停播100天真相揭示
   */
  generateHiatusTruth(state: PlayerState): string {
    const truths = [];

    if (state.personaIntegrity > 80) {
      truths.push('表演型人格崩溃：我演得太累了，忘了自己是谁');
    }
    if (state.failCount > 15) {
      truths.push('精神崩溃疗养：我需要停下来，找回理智');
    }
    if (state.kindness > 70 && state.sanity < 40) {
      truths.push('善意透支：我对所有人都好，除了自己');
    }
    if (state.money < 0) {
      truths.push('生存优先：直播养不活我，我得先活下去');
    }
    if (state.personaIntegrity < 30) {
      truths.push('真实自我觉醒：我不想再装了，我要做真实的自己');
    }

    if (truths.length === 0) {
      truths.push('主动修行：我需要时间，找到虚拟与现实的平衡');
    }

    return truths.join('；');
  }

  /**
   * 生成元叙事结尾
   */
  generateMetaEnding(ending: Ending): string {
    return `
【主播模拟器结束】

你亲历了小爱的人生，也读懂了她的挣扎。

互联网给了我们一个伪装自己的面具，
让我们可以成为任何想成为的人，
却也让我们渐渐迷失在虚拟与现实之间。

身份认同，从来不是选择虚拟或现实，
而是在两者之间，找到真正的自己，
不被标签绑架，不被流量裹挟。

停播100天的真相是：${ending.description}

屏幕光影渐亮，你回到自己的房间。
手机里的直播还在继续，小爱笑着说：
"谢谢大家等我，这100天，我终于找到了自己。"

你看着屏幕里的她，仿佛看到了那个在模拟器里，
一次次挣扎、一次次抉择的自己——
原来，我们每个人，都在现实与虚拟之间，
寻找着属于自己的身份答案。
    `.trim();
  }

  /**
   * 获取结局统计
   */
  getEndingStats(
    state: PlayerState,
    triggeredEvents: string[]
  ): {
    endingType: EndingType;
    endingName: string;
    totalEvents: number;
    storyCompletion: number;
  } {
    const ending = this.determineEnding(state, triggeredEvents, {});
    const storyNodes = ['node1_landlady', 'node2_harassment', 'node3_doudou', 
                       'node4_kexin', 'node5_pk', 'node6_mother'];
    const completedStoryNodes = triggeredEvents.filter(e => storyNodes.includes(e));
    
    return {
      endingType: ending.id,
      endingName: ending.name,
      totalEvents: triggeredEvents.length,
      storyCompletion: Math.floor((completedStoryNodes.length / storyNodes.length) * 100)
    };
  }
}

/**
 * 创建结局系统的工厂函数
 */
export function createEndingSystem(): EndingSystem {
  return new EndingSystem();
}
