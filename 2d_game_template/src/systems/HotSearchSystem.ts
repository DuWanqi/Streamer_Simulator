/**
 * 热搜系统 - 生成微博风格热搜
 *
 * 根据设计案第7章：热搜系统
 */

import type { PlayerData } from '../game/PlayerData';
import type { StoryNode } from '../events/StoryNodes';

export interface HotSearchItem {
  keyword: string;
  heat: number;
  hotComment: string;
  rank: number;
  isRising: boolean;
}

export class HotSearchSystem {
  private playerData: PlayerData;

  // 热搜词条模板
  private readonly keywordTemplates: Record<string, string[]> = {
    'beauty_fail': ['#小爱素颜曝光#', '#主播美颜失效现场#', '#小爱真实颜值#'],
    'mic_on': ['#小爱下播后骂粉丝#', '#主播忘关麦现场#', '#小爱真性情#'],
    'crash': ['#小爱直播软件崩溃#', '#主播出租屋曝光#', '#小爱room tour#'],
    'sleep': ['#小爱直播睡觉上热搜#', '#主播直播睡眠8小时#', '#小爱睡播#'],
    'cry': ['#小爱直播间崩溃大哭#', '#主播情绪失控现场#', '#小爱哭了#'],
    'pk': ['#小爱与月牙儿世纪PK#', '#主播PK大战#', '#小爱PK获胜#'],
    'harassment': ['#小爱被邻居骚扰#', '#主播遭遇网暴#', '#小爱发声#'],
    'doudou': ['#小爱捡到流浪狗#', '#主播与豆豆#', '#小爱萌宠直播#'],
    'landlady': ['#小爱救助房东太太#', '#主播救人错过PK#', '#小爱善良#'],
    'kexin': ['#小爱室友离世#', '#主播悼念可心#', '#小爱发声#'],
    'comeback': ['#小爱停播100天回归#', '#主播消失百日真相#', '#小爱回来了#'],
  };

  // 热评模板
  private readonly commentTemplates: string[] = [
    '这不是同一个人吧？',
    '主播嘴真硬，但我爱看',
    '别人直播赚钱，她直播赚睡眠',
    '主播疯了但好可爱，关注了',
    '狼来了现代版，但真香',
    '互联网永远不会忘记',
    '这就是真实的主播生活吗',
    '心疼主播，但好好笑',
    '这波操作我给满分',
    '主播在第五层，我们在第一层',
    '这是什么神仙主播',
    '笑死我了，关注了',
  ];

  constructor(playerData: PlayerData) {
    this.playerData = playerData;
  }

  /**
   * 根据事件生成热搜
   */
  generate(eventType: string, eventData?: StoryNode): HotSearchItem | null {
    const keywords = this.keywordTemplates[eventType];
    if (!keywords || keywords.length === 0) {
      return null;
    }

    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    const heat = this.generateHeat();
    const hotComment = this.generateHotComment();

    const hotSearch: HotSearchItem = {
      keyword,
      heat,
      hotComment,
      rank: Math.floor(Math.random() * 10) + 1,
      isRising: Math.random() > 0.3,
    };

    // 记录到玩家数据
    this.playerData.addTrendingTopic(keyword);

    return hotSearch;
  }

  /**
   * 生成随机热搜（无特定事件）
   */
  generateRandom(): HotSearchItem | null {
    const allKeywords = Object.values(this.keywordTemplates).flat();
    if (allKeywords.length === 0) return null;

    const keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)];
    const heat = this.generateHeat();
    const hotComment = this.generateHotComment();

    return {
      keyword,
      heat,
      hotComment,
      rank: Math.floor(Math.random() * 10) + 1,
      isRising: Math.random() > 0.5,
    };
  }

  /**
   * 生成热度值（1万-500万）
   */
  private generateHeat(): number {
    const baseHeat = 10000;
    const maxHeat = 5000000;
    const randomFactor = Math.random();

    // 使用指数分布，让高热度更稀有
    const heat = Math.floor(baseHeat + (maxHeat - baseHeat) * Math.pow(randomFactor, 2));

    // 格式化为易读的形式
    return heat;
  }

  /**
   * 格式化热度显示
   */
  static formatHeat(heat: number): string {
    if (heat >= 10000) {
      return (heat / 10000).toFixed(1) + '万';
    }
    return heat.toString();
  }

  /**
   * 生成热评
   */
  private generateHotComment(): string {
    return this.commentTemplates[Math.floor(Math.random() * this.commentTemplates.length)];
  }

  /**
   * 生成热搜列表（显示用）
   */
  generateHotSearchList(count: number = 10): HotSearchItem[] {
    const list: HotSearchItem[] = [];
    const allKeywords = Object.values(this.keywordTemplates).flat();

    for (let i = 0; i < count; i++) {
      const keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)];
      list.push({
        keyword,
        heat: this.generateHeat(),
        hotComment: this.generateHotComment(),
        rank: i + 1,
        isRising: Math.random() > 0.5,
      });
    }

    // 按热度排序
    return list.sort((a, b) => b.heat - a.heat);
  }

  /**
   * 获取当前热搜列表（用于微博APP）
   */
  getCurrentHotSearches(count: number = 10): HotSearchItem[] {
    return this.generateHotSearchList(count);
  }

  /**
   * 根据剧情节点生成热搜
   */
  generateFromStoryNode(node: StoryNode): HotSearchItem | null {
    const nodeTypeMap: Record<string, string> = {
      'node1_landlady': 'landlady',
      'node2_harassment': 'harassment',
      'node3_doudou': 'doudou',
      'node4_kexin': 'kexin',
      'node5_pk': 'pk',
      'node6_mother': 'comeback',
    };

    const eventType = nodeTypeMap[node.id];
    if (!eventType) return null;

    return this.generate(eventType, node);
  }

  /**
   * 获取玩家历史热搜
   */
  getPlayerTrendingHistory(): string[] {
    return this.playerData.getState().trendingTopics;
  }

  /**
   * 生成热搜描述文本
   */
  generateDescription(hotSearch: HotSearchItem): string {
    const rankText = hotSearch.rank <= 3 ? `🔥 第${hotSearch.rank}位` : `第${hotSearch.rank}位`;
    const risingText = hotSearch.isRising ? '📈 上升中' : '';
    const heatText = HotSearchSystem.formatHeat(hotSearch.heat);

    return `${rankText} ${risingText}\n${hotSearch.keyword}\n热度：${heatText}\n热评："${hotSearch.hotComment}"`;
  }
}
