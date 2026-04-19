/**
 * 热搜系统
 * 生成微博风格热搜词条
 */

import { logger } from '../core/DebugLogger';
import type { HotSearch, GameEvent, PlayerState } from '../data/Types';

export interface HotSearchGenerationParams {
  event: GameEvent;
  playerState: PlayerState;
  choiceText?: string;
}

export class HotSearchSystem {
  private hotSearchHistory: HotSearch[] = [];
  private readonly MAX_HISTORY = 20;

  constructor() {
    logger.log('info', 'HotSearchSystem', '热搜系统初始化完成');
  }

  /**
   * 生成热搜
   */
  generate(params: HotSearchGenerationParams): HotSearch {
    const { event, playerState } = params;
    
    // 根据事件类型和玩家状态生成热搜
    const keyword = this.generateKeyword(event, playerState);
    const heat = this.calculateHeat(event, playerState);
    const hotComment = this.generateHotComment(event, playerState);

    const hotSearch: HotSearch = {
      id: `hs_${Date.now()}`,
      keyword,
      heat: this.formatHeat(heat),
      hotComment,
      timestamp: Date.now()
    };

    this.addToHistory(hotSearch);

    logger.log('info', 'HotSearchSystem', '生成热搜', { 
      keyword, 
      heat: hotSearch.heat 
    });

    return hotSearch;
  }

  /**
   * 生成热搜词条
   */
  private generateKeyword(event: GameEvent, state: PlayerState): string {
    const templates: Record<string, string[]> = {
      'node1_landlady': ['#小爱救人放弃PK#', '#小爱楼道救人#', '#主播放弃PK救人#'],
      'node2_harassment': ['#小爱自己清楚#', '#小爱回应谣言#', '#主播被网暴#'],
      'node3_doudou': ['#小爱收养流浪狗#', '#主播与豆豆#', '#流浪狗豆豆#'],
      'node4_kexin': ['#小爱室友去世#', '#主播悼念好友#', '#小爱吃人血馒头#'],
      'node5_pk': ['#小爱月牙儿PK#', '#主播世纪对决#', '#小爱PK黑料#'],
      'node6_mother': ['#小爱母亲患病#', '#主播照顾母亲#', '#小爱停播照顾家人#'],
      
      'tech_1_beauty_fail': ['#小爱素颜曝光#', '#主播美颜失效#', '#小爱真实颜值#'],
      'tech_2_mic_on': ['#小爱下播后骂粉丝#', '#主播忘关麦#', '#小爱真性情#'],
      'tech_3_crash': ['#小爱出租屋曝光#', '#主播房间揭秘#', '#小爱真实生活#'],
      'tech_6_deepfake': ['#小爱AI换脸#', '#主播被AI恶搞#', '#小爱视频被盗用#'],
      
      'social_2_parents_visit': ['#小爱父母查岗#', '#主播爸妈入镜#', '#小爱家庭直播#'],
      'social_4_ex': ['#小爱前任连麦#', '#主播前任出现#', '#小爱旧情复燃#'],
      
      'skill_1_game_lose': ['#小爱游戏连败#', '#主播连跪10把#', '#小爱菜得真实#'],
      'skill_2_talent_fail': ['#小爱才艺翻车#', '#主播唱歌破音#', '#小爱跳舞摔倒#'],
      'skill_6_sleep': ['#小爱直播睡觉#', '#主播睡着上热搜#', '#小爱睡眠直播#'],
      
      'persona_2_fake_luxury': ['#小爱奢侈品假货#', '#主播炫富翻车#', '#小爱 fake包#'],
      'persona_3_fake_background': ['#小爱学历造假#', '#主播经历造假#', '#小爱人设崩塌#'],
      'persona_4_fake_data': ['#小爱买粉实锤#', '#主播数据造假#', '#小爱掉粉#'],
      
      'platform_3_ai_audience': ['#小爱直播间全是AI#', '#主播观众是机器人#', '#小爱发现真相#'],
      'platform_6_time_travel': ['#小爱穿越了#', '#主播回到开播第一天#', '#小爱重开#']
    };

    const eventTemplates = templates[event.id];
    if (eventTemplates) {
      return eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    }

    // 默认模板
    const defaultTemplates = [
      `#小爱${event.title}#`,
      `#主播${event.title}#`,
      `#小爱直播${event.title}#`
    ];
    return defaultTemplates[Math.floor(Math.random() * defaultTemplates.length)];
  }

  /**
   * 计算热度值
   */
  private calculateHeat(event: GameEvent, state: PlayerState): number {
    let baseHeat = 10000;

    // 根据事件类型调整基础热度
    if (event.type === 'story') {
      baseHeat = 500000; // 剧情节点热度更高
    } else if (event.isMajor) {
      baseHeat = 300000;
    } else if (event.category?.includes('fail')) {
      baseHeat = 200000;
    }

    // 根据粉丝数调整热度
    const followerMultiplier = 1 + (state.followers / 100000);
    
    // 随机波动
    const randomFactor = 0.8 + Math.random() * 0.4;

    return Math.floor(baseHeat * followerMultiplier * randomFactor);
  }

  /**
   * 格式化热度显示
   */
  private formatHeat(heat: number): string {
    if (heat >= 1000000) {
      return (heat / 10000).toFixed(0) + '万';
    } else if (heat >= 10000) {
      return (heat / 10000).toFixed(1) + '万';
    }
    return heat.toString();
  }

  /**
   * 生成热评
   */
  private generateHotComment(event: GameEvent, state: PlayerState): string {
    const comments: Record<string, string[]> = {
      'tech_fail': [
        '这不是同一个人吧？',
        '主播嘴真硬，但我爱看',
        '翻车即内容，失控即流量',
        '互联网永远不会忘记',
        '主播疯了但好可爱，关注了'
      ],
      'social_fail': [
        '社死现场，我替人尴尬的毛病又犯了',
        '主播家人：原来你是干这个的？',
        '这波是真实生活大揭秘',
        '主播：我太难了'
      ],
      'skill_fail': [
        '菜得真实，关注了',
        '主播在第五层，我们在第一层',
        '这波操作我给满分',
        '翻车比正片好看'
      ],
      'persona_fail': [
        '人设崩塌，互联网没有记忆',
        '主播：我演得太累了',
        '这就是真实的主播吗？',
        '翻车即封神'
      ],
      'platform_fail': [
        '细思极恐',
        '主播发现了世界的真相',
        '这就是算法时代吗？',
        '主播：我悟了'
      ],
      'main_story': [
        '主播太难了',
        '这就是生活啊',
        '主播加油！',
        '看得我泪目了'
      ]
    };

    const categoryComments = event.category ? comments[event.category] : null;
    const eventComments = event.type === 'story' ? comments['main_story'] : null;
    
    const selectedComments = categoryComments || eventComments || comments['tech_fail'];
    return selectedComments[Math.floor(Math.random() * selectedComments.length)];
  }

  /**
   * 生成AI Prompt（用于调用AI生成热搜）
   */
  generateAIPrompt(params: HotSearchGenerationParams): string {
    return `
根据以下事件生成微博风格热搜：

事件：${params.event.title}
事件描述：${params.event.description}
主播：小爱
当前人气：${params.playerState.followers}

请返回JSON格式：
{
  "keyword": "热搜词条（15字以内，带#号）",
  "heat": 热度值（10000-5000000）,
  "hot_comment": "网友热评（搞笑风格，20字以内）"
}
    `.trim();
  }

  /**
   * 解析AI生成的热搜
   */
  parseAIGeneratedHotSearch(text: string): HotSearch | null {
    try {
      const data = JSON.parse(text);
      return {
        id: `hs_${Date.now()}`,
        keyword: data.keyword,
        heat: this.formatHeat(data.heat),
        hotComment: data.hot_comment,
        timestamp: Date.now()
      };
    } catch (e) {
      logger.log('error', 'HotSearchSystem', '解析AI热搜失败', { error: e });
      return null;
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(hotSearch: HotSearch): void {
    this.hotSearchHistory.push(hotSearch);
    if (this.hotSearchHistory.length > this.MAX_HISTORY) {
      this.hotSearchHistory.shift();
    }
  }

  /**
   * 获取热搜历史
   */
  getHistory(): HotSearch[] {
    return [...this.hotSearchHistory];
  }

  /**
   * 获取最新热搜
   */
  getLatest(count: number = 5): HotSearch[] {
    return this.hotSearchHistory.slice(-count);
  }

  /**
   * 清空历史
   */
  clearHistory(): void {
    this.hotSearchHistory = [];
    logger.log('info', 'HotSearchSystem', '热搜历史已清空');
  }

  /**
   * 重置系统
   */
  reset(): void {
    this.clearHistory();
    logger.log('info', 'HotSearchSystem', '热搜系统已重置');
  }

  /**
   * 获取热搜统计
   */
  getStats(): {
    totalCount: number;
    highestHeat: string;
    averageHeat: string;
  } {
    if (this.hotSearchHistory.length === 0) {
      return { totalCount: 0, highestHeat: '0', averageHeat: '0' };
    }

    const heats = this.hotSearchHistory.map(hs => {
      const num = parseFloat(hs.heat.replace('万', ''));
      return hs.heat.includes('万') ? num * 10000 : num;
    });

    const highest = Math.max(...heats);
    const average = heats.reduce((a, b) => a + b, 0) / heats.length;

    return {
      totalCount: this.hotSearchHistory.length,
      highestHeat: this.formatHeat(highest),
      averageHeat: this.formatHeat(average)
    };
  }
}

/**
 * 创建热搜系统的工厂函数
 */
export function createHotSearchSystem(): HotSearchSystem {
  return new HotSearchSystem();
}
