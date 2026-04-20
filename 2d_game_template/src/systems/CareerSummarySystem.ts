/**
 * AI生涯总结系统
 * 生成《小爱主播生涯纪录片》
 */

import { logger } from '../core/DebugLogger';
import type { PlayerState, HotSearch, NPCId } from '../data/Types';
import { NPCS } from '../game/GameConfig';

export interface CareerSummary {
  title: string;
  type: CareerSummaryType;
  opening: string;
  highlights: CareerHighlight[];
  dataSummary: DataSummary;
  danmakuReview: string;
  truth: string;
  ending: string;
}

export type CareerSummaryType = 
  | 'legendary'      // 传奇之路
  | 'fail_king'      // 翻车之王
  | 'crazy_beauty'   // 疯批美人
  | 'real_self'      // 真实自我
  | 'social_death'   // 社死传说
  | 'buddha';        // 佛系主播

export interface CareerHighlight {
  day: number;
  title: string;
  description: string;
  impact: string;
}

export interface DataSummary {
  finalFollowers: string;
  peakViewers: string;
  failCount: number;
  worstFail: string;
  bestTrending: string;
  topMemes: string[];
  personalitySummary: Record<string, string>;
}

export class CareerSummarySystem {
  constructor() {
    logger.log('info', 'CareerSummarySystem', '生涯总结系统初始化完成');
  }

  /**
   * 生成生涯总结类型
   */
  determineSummaryType(state: PlayerState): CareerSummaryType {
    // 传奇之路：人气达到顶流
    if (state.followers >= 1000000) {
      return 'legendary';
    }
    
    // 翻车之王：翻车次数>20
    if (state.failCount >= 20) {
      return 'fail_king';
    }
    
    // 疯批美人：精神值波动极大
    if (state.sanity <= 20 || state.sanity >= 90) {
      return 'crazy_beauty';
    }
    
    // 真实自我：人设完整度<20
    if (state.personaIntegrity <= 20) {
      return 'real_self';
    }
    
    // 社死传说：翻车次数>10且善良值低
    if (state.failCount >= 10 && state.kindness <= 30) {
      return 'social_death';
    }
    
    // 佛系主播：善良值高且稳定
    if (state.kindness >= 70) {
      return 'buddha';
    }
    
    // 默认：传奇之路
    return 'legendary';
  }

  /**
   * 生成生涯总结
   */
  generate(
    state: PlayerState,
    hotSearchHistory: HotSearch[],
    triggeredEvents: string[],
    npcRelations: Record<NPCId, number>
  ): CareerSummary {
    const type = this.determineSummaryType(state);
    
    const summary: CareerSummary = {
      title: this.getTitle(type),
      type,
      opening: this.generateOpening(type, state),
      highlights: this.generateHighlights(triggeredEvents),
      dataSummary: this.generateDataSummary(state, hotSearchHistory),
      danmakuReview: this.generateDanmakuReview(type, state),
      truth: this.generateTruth(state),
      ending: this.generateEnding(type, state, npcRelations)
    };

    logger.log('info', 'CareerSummarySystem', '生涯总结生成完成', { type });
    return summary;
  }

  /**
   * 获取总结标题
   */
  private getTitle(type: CareerSummaryType): string {
    const titles: Record<CareerSummaryType, string> = {
      legendary: '《传奇之路：一个顶流的诞生》',
      fail_king: '《翻车之王：史上最离谱的直播生涯》',
      crazy_beauty: '《疯批美人：她疯了，但我们都爱她》',
      real_self: '《真实自我：互联网最后一个真人》',
      social_death: '《社死传说：互联网永远不会忘记》',
      buddha: '《佛系主播：清流，但没什么人看》'
    };
    return titles[type];
  }

  /**
   * 生成开场白
   */
  private generateOpening(type: CareerSummaryType, state: PlayerState): string {
    const openings: Record<CareerSummaryType, string[]> = {
      legendary: [
        `欢迎收看本期《主播人生》，今天我们要讲述的是一位从0到${(state.followers / 10000).toFixed(0)}万粉丝的传奇故事。`,
        '她用了20天，走完了别人20年才能走完的路。',
        '这不是童话，这是真实发生在这个直播间的故事。'
      ],
      fail_king: [
        `20天，${state.failCount}次翻车，平均每天要翻车${(state.failCount / 20).toFixed(1)}次。`,
        '这不是直播，这是行为艺术。',
        '欢迎来到翻车之王的荒诞直播间。'
      ],
      crazy_beauty: [
        '有人说她疯了，有人说她是天才。',
        '在这个直播间里，理智和疯狂只有一线之隔。',
        '这是一个关于失控与重生的故事。'
      ],
      real_self: [
        '在这个人人都在表演的时代，她选择做真实的自己。',
        '没有滤镜，没有剧本，只有最原始的真诚。',
        '这可能是互联网上最后一个真人。'
      ],
      social_death: [
        '互联网有记忆，而且记性特别好。',
        '每一次社死，都是一次互联网永恒的记忆。',
        '这是一个关于社死与救赎的故事。'
      ],
      buddha: [
        '她不抢热点，不蹭流量，只是静静地直播。',
        '在这个浮躁的时代，她是一股清流。',
        '虽然没什么人看，但她依然坚持。'
      ]
    };
    
    return openings[type].join('\n');
  }

  /**
   * 生成名场面回顾
   */
  private generateHighlights(triggeredEvents: string[]): CareerHighlight[] {
    const highlights: CareerHighlight[] = [];
    
    const eventHighlights: Record<string, CareerHighlight> = {
      'node1_landlady': {
        day: 3,
        title: '楼道里的抉择',
        description: '在PK和救人之间，她做出了选择',
        impact: '这个选择定义了她的人格'
      },
      'node2_harassment': {
        day: 11,
        title: '网暴风暴',
        description: '面对谣言和攻击，她选择了自己的方式应对',
        impact: '这次事件让她更加坚强'
      },
      'node3_doudou': {
        day: 6,
        title: '雨中的相遇',
        description: '一只流浪狗改变了她的生活',
        impact: '豆豆成为了她最重要的家人'
      },
      'node4_kexin': {
        day: 10,
        title: '无法承受之重',
        description: '室友的离去让她明白了生命的脆弱',
        impact: '这次悲剧让她重新审视人生'
      },
      'node5_pk': {
        day: 16,
        title: '巅峰对决',
        description: '面对竞争对手的黑料，她做出了选择',
        impact: '这个选择体现了她的品格'
      },
      'node6_mother': {
        day: 20,
        title: '最终的抉择',
        description: '在事业和家人之间，她必须做出选择',
        impact: '这个选择决定了她的结局'
      }
    };

    for (const eventId of triggeredEvents) {
      if (eventHighlights[eventId]) {
        highlights.push(eventHighlights[eventId]);
      }
    }

    return highlights.slice(0, 4);
  }

  /**
   * 生成数据大盘点
   */
  private generateDataSummary(
    state: PlayerState,
    hotSearchHistory: HotSearch[]
  ): DataSummary {
    // 格式化粉丝数
    const finalFollowers = state.followers >= 10000 
      ? (state.followers / 10000).toFixed(1) + '万'
      : state.followers.toString();

    // 最高在线（估算）
    const peakViewers = Math.floor(state.followers * 0.3);
    const peakViewersStr = peakViewers >= 10000
      ? (peakViewers / 10000).toFixed(1) + '万'
      : peakViewers.toString();

    // 最出圈热搜
    const bestTrending = hotSearchHistory.length > 0
      ? hotSearchHistory.reduce((max, hs) => {
          const heat1 = parseFloat(hs.heat.replace('万', '')) * (hs.heat.includes('万') ? 10000 : 1);
          const heat2 = parseFloat(max.heat.replace('万', '')) * (max.heat.includes('万') ? 10000 : 1);
          return heat1 > heat2 ? hs : max;
        }).keyword
      : '#小爱直播#';

    // 最离谱翻车
    const worstFails = [
      '美颜失效素颜曝光',
      '忘关麦吐槽粉丝',
      '直播软件崩溃房间曝光',
      'AI换脸视频风波',
      '学历造假被扒皮',
      '数据买粉实锤',
      '直播睡觉上热搜'
    ];
    const worstFail = worstFails[Math.floor(Math.random() * worstFails.length)];

    // 最火梗
    const memes = [
      '翻车即内容',
      '失控即流量',
      '社死即封神',
      '主播在第五层',
      '经典复刻',
      '互联网没有记忆'
    ];
    const topMemes = memes.slice(0, 3);

    // 弹幕人格互动摘要
    const personalitySummary: Record<string, string> = {
      '老粉阿伟': '翻旧账次数：数不清',
      '黑粉头子': '骂得最狠，打赏最多',
      '考据党': '统计了所有翻车数据',
      '奶奶粉': '最关心主播的身体',
      '潜水员': '关键时刻的神评论'
    };

    return {
      finalFollowers,
      peakViewers: peakViewersStr,
      failCount: state.failCount,
      worstFail,
      bestTrending,
      topMemes,
      personalitySummary
    };
  }

  /**
   * 生成弹幕之神说
   */
  private generateDanmakuReview(type: CareerSummaryType, state: PlayerState): string {
    const reviews: Record<CareerSummaryType, string[]> = {
      legendary: [
        '【老粉阿伟】从她第一天直播我就在看，没想到她能走到今天',
        '【黑粉头子】虽然我一直黑她，但不得不承认她确实厉害',
        '【考据党】数据显示，她的涨粉速度创造了平台纪录',
        '【梗百科】这就是传说中的传奇之路吧',
        '【奶奶粉】孩子终于成功了，奶奶为你骄傲'
      ],
      fail_king: [
        '【老粉阿伟】我记得她第一次翻车，那时候她还只是个新人',
        '【黑粉头子】我就是来看她翻车的，每次都有新惊喜',
        '【考据党】统计：20天翻车' + state.failCount + '次，平均每日' + (state.failCount / 20).toFixed(1) + '次',
        '【梗百科】翻车即内容，失控即流量',
        '【潜水员】这是行为艺术，你们不懂'
      ],
      crazy_beauty: [
        '【老粉阿伟】她疯了吗？也许吧，但这就是她',
        '【黑粉头子】疯批美人，我爱了',
        '【考据党】精神值波动曲线比心电图还刺激',
        '【奶奶粉】孩子是不是压力太大了？',
        '【梗百科】她疯了，但我们都爱她'
      ],
      real_self: [
        '【老粉阿伟】在这个人人都在表演的时代，她选择做真实的自己',
        '【黑粉头子】虽然没什么节目效果，但确实真实',
        '【考据党】人设完整度历史最低，但粉丝粘性最高',
        '【奶奶粉】这孩子实诚，奶奶喜欢',
        '【潜水员】互联网最后一个真人'
      ],
      social_death: [
        '【老粉阿伟】每一次社死，都是一次互联网永恒的记忆',
        '【黑粉头子】社死现场，我替人尴尬的毛病又犯了',
        '【考据党】社死事件统计：' + state.failCount + '次',
        '【梗百科】互联网永远不会忘记',
        '【潜水员】截图了，保存了，永流传'
      ],
      buddha: [
        '【老粉阿伟】她不抢热点，不蹭流量，只是静静地直播',
        '【黑粉头子】太佛系了，黑都黑不动',
        '【考据党】数据一般，但口碑很好',
        '【奶奶粉】这孩子心态好，奶奶放心',
        '【梗百科】清流，但没什么人看'
      ]
    };

    return reviews[type].join('\n');
  }

  /**
   * 生成停播100天真相
   */
  private generateTruth(state: PlayerState): string {
    if (state.personaIntegrity > 80) {
      return '表演型人格崩溃：我演得太累了，忘了自己是谁。停播的100天，我在寻找那个真实的自己。';
    }
    if (state.failCount > 15) {
      return '精神崩溃疗养：连续翻车让我身心俱疲。停播的100天，我在找回理智和平衡。';
    }
    if (state.kindness > 70 && state.sanity < 40) {
      return '善意透支：我对所有人都好，除了自己。停播的100天，我学会了如何爱自己。';
    }
    if (state.money < 0) {
      return '生存优先：直播养不活我，我得先活下去。停播的100天，我在为生计奔波。';
    }
    if (state.personaIntegrity < 30) {
      return '真实自我觉醒：我不想再装了，我要做真实的自己。停播的100天，我在接纳真实的自己。';
    }
    return '主动修行：我需要时间，找到虚拟与现实的平衡。停播的100天，我在寻找属于自己的人生答案。';
  }

  /**
   * 生成结尾
   */
  private generateEnding(
    type: CareerSummaryType,
    state: PlayerState,
    npcRelations: Record<NPCId, number>
  ): string {
    // 根据NPC关系生成不同的结尾
    const npcMap = new Map(NPCS.map(n => [n.id, n]));
    const highRelationNPCs = Object.entries(npcRelations)
      .filter(([, value]) => value >= 60)
      .map(([key]) => {
        const npc = npcMap.get(key as NPCId);
        return npc ? npc.name : null;
      })
      .filter((name): name is string => name !== null);

    const baseEnding = '这就是小爱的故事。一个关于虚拟与现实、表演与真实、流量与人性的故事。';
    
    if (highRelationNPCs.length >= 3) {
      return baseEnding + `\n\n她收获了${highRelationNPCs.join('、')}的友谊，这才是最珍贵的财富。\n\n停播100天后，她带着这些温暖回归，用真实的自我继续直播。因为她明白：互联网身份只是一部分，真正的身份认同是接纳现实中的自己。`;
    }
    
    if (state.followers >= 1000000) {
      return baseEnding + `\n\n她成为了千万粉丝的顶流主播，拥有了曾经梦想的一切。\n\n但停播100天后，她开始思考：这些数字背后，真正的自己在哪里？`;
    }

    return baseEnding + `\n\n20天的直播生涯，像一场梦。\n\n停播100天后，她终于明白：身份认同，从来不是选择虚拟或现实，而是在两者之间，找到真正的自己。`;
  }

  /**
   * 生成AI Prompt
   */
  generateAIPrompt(
    state: PlayerState,
    hotSearchHistory: HotSearch[],
    triggeredEvents: string[]
  ): string {
    const type = this.determineSummaryType(state);
    const dataSummary = this.generateDataSummary(state, hotSearchHistory);

    return `
你是一个综艺节目的旁白，正在为主播"小爱"的直播生涯做总结回顾。

生涯类型：${this.getTitle(type)}

数据：
- 最终人气：${dataSummary.finalFollowers}
- 最高在线：${dataSummary.peakViewers}
- 翻车次数：${state.failCount}
- 最离谱翻车：${dataSummary.worstFail}
- 最出圈热搜：${dataSummary.bestTrending}
- 被提最多的梗：${dataSummary.topMemes.join('、')}
- 停播100天真相：${this.generateTruth(state)}

生成内容：
1. 开场白（综艺感，夸张）
2. "名场面回顾"（3-4个经典瞬间）
3. "数据大盘点"（搞笑方式解读）
4. "弹幕之神说"（弹幕人格语气评价）
5. 结尾（温暖/荒诞/哲理，但要好笑）

风格：搞笑、温暖、偶尔走心但马上用笑话拉回来
    `.trim();
  }

  /**
   * 获取生涯总结类型名称
   */
  getSummaryTypeName(type: CareerSummaryType): string {
    const names: Record<CareerSummaryType, string> = {
      legendary: '传奇之路',
      fail_king: '翻车之王',
      crazy_beauty: '疯批美人',
      real_self: '真实自我',
      social_death: '社死传说',
      buddha: '佛系主播'
    };
    return names[type];
  }
}

/**
 * 创建生涯总结系统的工厂函数
 */
export function createCareerSummarySystem(): CareerSummarySystem {
  return new CareerSummarySystem();
}
