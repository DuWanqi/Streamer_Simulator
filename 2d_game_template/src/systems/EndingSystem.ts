/**
 * 结局系统 - 判定游戏结局
 *
 * 根据设计案第9章：结局系统（5个结局）
 */

import type { PlayerData } from '../game/PlayerData';
import { ENDINGS, type EndingType } from '../game/GameConfig';

export interface EndingResult {
  type: EndingType;
  name: string;
  description: string;
  epilogue: string;
  truth: string;
  isGoodEnding: boolean;
}

export class EndingSystem {
  private playerData: PlayerData;

  constructor(playerData: PlayerData) {
    this.playerData = playerData;
  }

  /**
   * 判定结局
   */
  determineEnding(): EndingResult {
    const state = this.playerData.getState();
    const { kindness, integrity, sanity, personaIntegrity, npcRelations, survival, income } = state;

    // 检查结局五：真相大白·双向救赎（完美结局）
    if (
      kindness >= 70 &&
      integrity >= 70 &&
      npcRelations.mom >= 60 &&
      npcRelations.doudou >= 60 &&
      npcRelations.kexin >= 60 &&
      (state.storyChoices['node6_mother'] === 'go_home' || state.storyChoices['node6_mother'] === 'bring_mom')
    ) {
      return this.createEnding('redemption');
    }

    // 检查结局一：自我和解·回归本真（偏圆满）
    if (
      kindness >= 60 &&
      integrity >= 60 &&
      npcRelations.mom >= 60 &&
      npcRelations.doudou >= 60 &&
      (npcRelations.kexin >= 60 || state.storyChoices['node4_kexin'] !== 'exploit_tragedy') &&
      personaIntegrity > 50
    ) {
      return this.createEnding('reconciliation');
    }

    // 检查结局四：双向崩塌·彻底沉寂（失败）
    if (
      income <= -1000 ||
      (npcRelations.landlady <= 0 && survival.rentDue >= 10) ||
      kindness < 20
    ) {
      return this.createEnding('collapse');
    }

    // 检查结局二：困于虚拟·彻底迷失（偏悲剧）
    if (
      kindness <= 40 &&
      integrity <= 40 &&
      npcRelations.mom <= 30 &&
      (npcRelations.kexin <= 30 || state.storyChoices['node4_kexin'] === 'exploit_tragedy') &&
      npcRelations.doudou <= 30 &&
      personaIntegrity < 30
    ) {
      return this.createEnding('lost');
    }

    // 检查结局三：逃离网络·回归现实（中性）
    if (
      sanity < 20 ||
      state.storyChoices['node6_mother'] === 'go_home' ||
      state.storyChoices['node2_harassment'] === 'ignore'
    ) {
      return this.createEnding('escape');
    }

    // 默认结局：根据综合数值判定
    if (kindness >= 50 && integrity >= 50) {
      return this.createEnding('reconciliation');
    } else if (kindness < 30 || integrity < 30) {
      return this.createEnding('lost');
    } else {
      return this.createEnding('escape');
    }
  }

  /**
   * 创建结局对象
   */
  private createEnding(type: EndingType): EndingResult {
    const endingConfig = ENDINGS.find(e => e.type === type)!;
    const state = this.playerData.getState();

    // 生成个性化真相
    const truth = this.generatePersonalizedTruth(type, state);

    // 生成尾声
    const epilogue = this.generateEpilogue(type);

    return {
      type,
      name: endingConfig.name,
      description: endingConfig.description,
      epilogue,
      truth,
      isGoodEnding: type === 'reconciliation' || type === 'redemption',
    };
  }

  /**
   * 生成个性化真相
   */
  private generatePersonalizedTruth(type: EndingType, state: ReturnType<PlayerData['getState']>): string {
    const truthTemplates: Record<EndingType, string[]> = {
      reconciliation: [
        '我演得太累了，忘了自己是谁。停播的100天，我在老家重新找回了那个不戴面具的自己。',
        '直播让我得到了很多，但也让我失去了更多。现在我明白，真实比完美更珍贵。',
      ],
      lost: [
        '我以为成为大主播就能得到一切，但最后发现，我把自己弄丢了。',
        '虚拟世界里的掌声再热烈，也填不满现实中的空虚。',
      ],
      escape: [
        '我需要停下来，找回理智。网络的光鲜都是假的，只有现实中的温暖是真的。',
        '直播养不活我的灵魂，我需要时间找到虚拟与现实的平衡。',
      ],
      collapse: [
        '我对所有人都好，除了自己。最后连自己都救不了。',
        '生存的压力让我喘不过气，有时候放弃也是一种选择。',
      ],
      redemption: [
        '我终于明白，身份认同不是选择虚拟或现实，而是在两者之间找到真正的自己。',
        '这100天，我学会了接纳自己的不完美，也学会了珍惜身边人的爱。',
      ],
    };

    const templates = truthTemplates[type];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * 生成尾声
   */
  private generateEpilogue(type: EndingType): string {
    const epilogues: Record<EndingType, string> = {
      reconciliation:
        '你删掉了直播软件，买了回家的车票。妈妈看到你时眼神迷茫，但握着我的手笑了。' +
        '豆豆摇着尾巴迎接你，房东太太说："回来就好。"你终于明白，互联网身份只是一部分，' +
        '真正的身份认同是接纳现实中的自己。',

      lost:
        '你拥有千万粉丝和巨额财富，住在豪华公寓里。深夜，你对着镜头笑着说"谢谢大家的支持"，' +
        '关掉直播后，房间里只剩下手机的微光。你试着给妈妈打电话，但她已经记不得你是谁了。' +
        '你活成了互联网的傀儡，却弄丢了自己。',

      escape:
        '你删除了账号，回老家找了一份稳定的工作。每天朝九晚五，周末陪妈妈散步。' +
        '偶尔会有路人认出你："你是不是那个主播？"你笑笑说："那是很久以前的事了。"' +
        '生活平淡却真实，你终于找到了内心的平静。',

      collapse:
        '你被赶出出租屋，设备被变卖抵债。你拖着行李箱走在街上，不知道该去哪里。' +
        '手机响了，是妈妈打来的，但你没有勇气接。你坐在公园的长椅上，看着夕阳西下。' +
        '也许明天会好一些，也许不会。但至少，你还活着。',

      redemption:
        '你带着粉丝的理解和家人的温暖回归直播。镜头前的你不再完美，但更加真实。' +
        '粉丝们说："这样的小爱我们更喜欢。"妈妈偶尔会出现在镜头里，虽然不知道发生了什么，' +
        '但看到弹幕夸她可爱时会笑。你终于找到了虚拟与现实的平衡，成为了真正的自己。',
    };

    return epilogues[type];
  }

  /**
   * 生成生涯总结
   */
  generateCareerSummary(): string {
    const state = this.playerData.getState();

    const summaries = [
      `20天的直播生涯，你从${PlayerData.formatNumber(100)}粉丝成长为${PlayerData.formatNumber(state.followers)}粉丝的主播。`,
      `经历了${state.failCount}次翻车，上了${state.trendingTopics.length}次热搜。`,
      `最终善良值${state.kindness}，诚信值${state.integrity}，精神值${state.sanity}。`,
      `与${Object.entries(state.npcRelations).filter(([_, v]) => v > 50).length}位NPC建立了深厚友谊。`,
    ];

    return summaries.join('\n');
  }

  /**
   * 获取结局统计
   */
  getEndingStats(): Record<string, number> {
    // 这里可以接入存储系统，统计玩家选择的结局分布
    return {
      reconciliation: 0,
      lost: 0,
      escape: 0,
      collapse: 0,
      redemption: 0,
    };
  }
}
