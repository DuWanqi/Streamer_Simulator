/**
 * 游戏配置常量
 */

// 阶段定义
export interface StageInfo {
  id: number;
  name: string;
  nameEn: string;
  minLevel: number;
  maxLevel: number;
  followerBoost: number;
  fanClubBoost: number;
  incomeBoost: number;
}

// 阶段定义 - 调整后符合中国互联网情况
// 百大主播：关注量100万~200万，直播间人数3000~1万+
// 平台顶流：关注量200万到1000万，直播间人数5000~2万+
// 名扬海外：关注量1000万到3000万，直播间人数1万~3万+
export const STAGES: StageInfo[] = [
  { id: 1, name: '不知名九流主播', nameEn: 'Unknown Newbie', minLevel: 1, maxLevel: 4, followerBoost: 1, fanClubBoost: 1, incomeBoost: 1 },
  { id: 2, name: '小有名气', nameEn: 'Rising Star', minLevel: 5, maxLevel: 8, followerBoost: 10, fanClubBoost: 8, incomeBoost: 10 },
  { id: 3, name: '百大主播', nameEn: 'Top 100', minLevel: 9, maxLevel: 12, followerBoost: 20, fanClubBoost: 15, incomeBoost: 20 },
  { id: 4, name: '平台顶流', nameEn: 'Platform King', minLevel: 13, maxLevel: 16, followerBoost: 30, fanClubBoost: 20, incomeBoost: 30 },
  { id: 5, name: '名扬海外', nameEn: 'World Famous', minLevel: 17, maxLevel: 99, followerBoost: 50, fanClubBoost: 30, incomeBoost: 50 },
];

export type AttributeType = 'appearance' | 'knowledge' | 'fame' | 'talent';

export interface AttributeConfig {
  type: AttributeType;
  name: string;
  icon: string;
  color: string;
  costs: number[];
}

export const ATTRIBUTES: AttributeConfig[] = [
  { type: 'appearance', name: '外貌', icon: 'face', color: '#fe2c55', costs: [1000, 2000, 5000, 10000, 20000] },
  { type: 'knowledge', name: '知识', icon: 'school', color: '#25f4ee', costs: [100, 200, 500, 1000, 2000] },
  { type: 'fame', name: '知名度', icon: 'campaign', color: '#ef4444', costs: [100, 200, 500, 1000, 2000] },
  { type: 'talent', name: '才艺', icon: 'palette', color: '#a855f7', costs: [5000, 10000, 25000, 50000, 100000] },
];

export type StreamCategory = 'music' | 'dance' | 'gaming' | 'variety';

export interface CategoryInfo {
  type: StreamCategory;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { type: 'music', name: '音乐歌手区', nameEn: 'Music Area', icon: 'music_note', color: '#fe2c55', description: '成为顶尖偶像歌手' },
  { type: 'dance', name: '舞蹈区', nameEn: 'Dance Area', icon: 'accessibility_new', color: '#25f4ee', description: '用舞蹈征服观众' },
  { type: 'gaming', name: '游戏区', nameEn: 'Gaming Area', icon: 'sports_esports', color: '#a855f7', description: '硬核游戏带飞全场' },
  { type: 'variety', name: '整活搞笑区', nameEn: 'Variety Area', icon: 'sentiment_very_satisfied', color: '#facc15', description: '用欢笑传递快乐' },
];

export type EventType = 'big_spender' | 'pk_battle' | 'big_streamer_raid' | 'rival_attack' | 'mcn_offer' | 'slander';

export interface EventConfig {
  type: EventType;
  name: string;
  baseWeights: number[];
}

export const EVENTS: EventConfig[] = [
  { type: 'big_spender', name: '土豪打赏', baseWeights: [15, 20, 25, 30, 35] },
  { type: 'pk_battle', name: 'PK挑战', baseWeights: [30, 30, 30, 30, 30] }, // 提高PK概率
  { type: 'big_streamer_raid', name: '大主播查房', baseWeights: [10, 15, 20, 25, 30] },
  { type: 'rival_attack', name: '同行互动', baseWeights: [20, 18, 15, 12, 10] }, // 改名
  { type: 'mcn_offer', name: 'MCN机构', baseWeights: [5, 12, 18, 20, 15] },
  { type: 'slander', name: '舆论事件', baseWeights: [15, 15, 12, 10, 8] }, // 改名
];

export const INITIAL_VALUES = {
  followers: 100,
  fanClub: 5,
  income: 5000,
  level: 1,
  appearance: 1,
  knowledge: 1,
  fame: 1,
  talent: 1,
};

export const MAX_DAYS = 20;
export const MAX_UPGRADES_PER_DAY = 2;
export const EVENTS_PER_DAY = { min: 3, max: 5 };
export const EVENT_INTERVAL = { min: 3, max: 5 };
