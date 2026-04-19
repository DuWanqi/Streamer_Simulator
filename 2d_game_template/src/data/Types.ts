/**
 * 游戏核心类型定义
 * 包含所有数据结构、事件定义、NPC定义等
 */

// ==================== 基础数值类型 ====================

/**
 * NPC关系类型
 */
export interface NPCRelations {
  landlady: number;   // 房东太太
  kexin: number;      // 可心
  mom: number;        // 妈妈
  doudou: number;     // 豆豆
  yueya: number;      // 月牙儿
  harasser: number;   // 猥琐男
}

/**
 * 生存状态
 */
export interface SurvivalStatus {
  rentDue: number;       // 房租拖欠天数
  utilitiesDue: number;  // 水电拖欠天数
  foodDays: number;      // 连续未吃食物天数
  internetDue: number;   // 网费拖欠天数
}

/**
 * 玩家状态
 */
export interface PlayerState {
  // 基础数值
  followers: number;        // 人气值
  stamina: number;          // 体力值
  kindness: number;         // 善良值
  integrity: number;        // 诚信值
  money: number;            // 经济值
  
  // 新增数值
  sanity: number;           // 精神值 0-100
  personaIntegrity: number; // 人设完整度 0-100
  
  // 系统数据
  day: number;              // 当前天数 1-20
  failCount: number;        // 翻车次数
  trendingTopics: string[]; // 热搜历史
  
  // NPC好感度
  npcRelations: NPCRelations;
  
  // 生存状态
  survival: SurvivalStatus;
}

/**
 * 玩家状态默认值
 */
export const DEFAULT_PLAYER_STATE: PlayerState = {
  followers: 0,
  stamina: 100,
  kindness: 50,
  integrity: 50,
  money: 500,
  sanity: 80,
  personaIntegrity: 50,
  day: 1,
  failCount: 0,
  trendingTopics: [],
  npcRelations: {
    landlady: 30,
    kexin: 80,
    mom: 40,
    doudou: 0,
    yueya: 20,
    harasser: 10
  },
  survival: {
    rentDue: 0,
    utilitiesDue: 0,
    foodDays: 0,
    internetDue: 0
  }
};

// ==================== 事件类型 ====================

/**
 * 事件类型
 */
export type EventType = 'story' | 'random';

/**
 * 事件分类
 */
export type EventCategory = 
  | 'tech_fail'      // 技术翻车
  | 'social_fail'    // 社交翻车
  | 'skill_fail'     // 技能翻车
  | 'persona_fail'   // 人设翻车
  | 'platform_fail'  // 平台事件
  | 'chaos_wild'     // 超现实事件
  | 'main_story';    // 主线剧情

/**
 * 选择效果
 */
export interface ChoiceEffect {
  followers?: number;
  stamina?: number;
  kindness?: number;
  integrity?: number;
  money?: number;
  sanity?: number;
  personaIntegrity?: number;
  npcRelations?: Partial<NPCRelations>;
}

/**
 * 事件选项
 */
export interface EventChoice {
  id: string;
  text: string;
  effects: ChoiceEffect;
  nextEvent?: string;
  condition?: (state: PlayerState) => boolean;
  hotSearchChance?: number; // 触发热搜的概率
}

/**
 * 游戏事件
 */
export interface GameEvent {
  id: string;
  type: EventType;
  category?: EventCategory;
  title: string;
  description: string;
  background?: string;
  character?: string;
  characterExpression?: string;
  choices: EventChoice[];
  triggerDay?: number | [number, number]; // 固定天数或天数范围
  triggerCondition?: (state: PlayerState) => boolean;
  isMajor?: boolean; // 是否重大事件（会触发热搜）
}

/**
 * 剧情节点（核心事件）
 */
export interface StoryNode {
  id: string;
  name: string;
  triggerDay: [number, number]; // 触发天数范围
  title: string;
  description: string;
  background?: string;
  character?: string;
  choices: EventChoice[];
  prerequisites?: {
    minFollowers?: number;
    npcRelations?: Partial<Record<keyof NPCRelations, number>>;
    completedNodes?: string[];
  };
}

/**
 * 随机翻车事件
 */
export interface RandomEvent {
  id: string;
  category: EventCategory;
  title: string;
  description: string;
  weight: number; // 权重（用于随机选择）
  once?: boolean; // 是否只能触发一次
  isMajor?: boolean; // 是否重大事件
  condition?: (state: PlayerState) => boolean; // 触发条件
  choices: EventChoice[];
}

/**
 * NPC ID类型
 */
export type NPCId = keyof NPCRelations;

// ==================== NPC类型 ====================

/**
 * NPC定义
 */
export interface NPC {
  id: keyof NPCRelations;
  name: string;
  description: string;
  initialRelation: number;
  appearDay: number;
  avatar?: string;
}

/**
 * NPC数据
 */
export const NPCS: Record<keyof NPCRelations, NPC> = {
  landlady: {
    id: 'landlady',
    name: '房东太太',
    description: '包租婆，刀子嘴豆腐心',
    initialRelation: 30,
    appearDay: 1
  },
  kexin: {
    id: 'kexin',
    name: '可心',
    description: '室友，善良但命苦',
    initialRelation: 80,
    appearDay: 3
  },
  mom: {
    id: 'mom',
    name: '妈妈',
    description: '患有阿尔茨海默症的母亲',
    initialRelation: 40,
    appearDay: 20
  },
  doudou: {
    id: 'doudou',
    name: '豆豆',
    description: '捡到的流浪狗',
    initialRelation: 0,
    appearDay: 6
  },
  yueya: {
    id: 'yueya',
    name: '月牙儿',
    description: '竞争对手主播',
    initialRelation: 20,
    appearDay: 16
  },
  harasser: {
    id: 'harasser',
    name: '猥琐男',
    description: '合租邻居，心怀不轨',
    initialRelation: 10,
    appearDay: 11
  }
};

// ==================== 生存系统类型 ====================

/**
 * 每日支出配置
 */
export interface DailyExpense {
  name: string;
  amount: number;
  description: string;
  overdueDays: number;  // 拖欠天数限制
  overdueEffect: string;
}

/**
 * 每日支出配置
 */
export const DAILY_EXPENSES: DailyExpense[] = [
  {
    name: '房租',
    amount: 100,
    description: '每月房租分摊',
    overdueDays: 10,
    overdueEffect: '被驱逐'
  },
  {
    name: '水电费',
    amount: 20,
    description: '水电煤气费',
    overdueDays: 3,
    overdueEffect: '断水断电'
  },
  {
    name: '食物',
    amount: 30,
    description: '每日食物开销',
    overdueDays: 2,
    overdueEffect: '体力值下降'
  },
  {
    name: '网费',
    amount: 10,
    description: '宽带费用',
    overdueDays: 1,
    overdueEffect: '断网无法直播'
  }
];

/**
 * 收入方式
 */
export interface IncomeSource {
  name: string;
  minAmount: number;
  maxAmount: number;
  condition: (state: PlayerState) => boolean;
  description: string;
}

// ==================== 弹幕人格类型 ====================

/**
 * 弹幕人格
 */
export interface DanmakuPersonality {
  id: string;
  name: string;
  description: string;
  style: string;
  sampleMessages: string[];
}

/**
 * 8个弹幕人格
 */
export const DANMAKU_PERSONALITIES: DanmakuPersonality[] = [
  {
    id: 'laofen',
    name: '老粉阿伟',
    description: '从第一天就在看，专门翻旧账',
    style: '怀旧、调侃',
    sampleMessages: [
      '我记得你上次也是这么说的',
      '主播又双叒叕翻车了',
      '老粉表示习惯了'
    ]
  },
  {
    id: 'heifen',
    name: '黑粉头子',
    description: '专门挑刺但打赏最多（氪金黑粉）',
    style: '毒舌、嘲讽',
    sampleMessages: [
      '唱得什么玩意儿，但我就爱看这个',
      '主播是不是没活了？',
      '这波操作我给0分'
    ]
  },
  {
    id: 'fanyi',
    name: '翻译君',
    description: '把主播的话翻译成奇怪语言',
    style: '翻译腔、文言文',
    sampleMessages: [
      '谢主隆恩，吾皇万岁万岁万万岁',
      '主播说：俺也一样',
      '翻译：这波啊，这波是经典复刻'
    ]
  },
  {
    id: 'yanwenzi',
    name: '颜文字怪',
    description: '只发颜文字和emoji',
    style: '符号、表情',
    sampleMessages: [
      '(๑°o°๑)',
      '(☆▽☆)',
      '(；′⌒`)'
    ]
  },
  {
    id: 'kaoju',
    name: '考据党',
    description: '统计主播的一切数据',
    style: '数据、分析',
    sampleMessages: [
      '今日翻车3次，累计47次',
      '主播涨粉速度：每小时+50',
      '根据统计，主播有87%概率翻车'
    ]
  },
  {
    id: 'nainai',
    name: '奶奶粉',
    description: '像奶奶一样关心主播，但经常误解梗',
    style: '温暖、误解',
    sampleMessages: [
      '主播怎么哭了？是不是有人欺负你？',
      '奶奶帮你骂他',
      '孩子，要注意身体啊'
    ]
  },
  {
    id: 'gengbaike',
    name: '梗百科',
    description: '行走的互联网梗词典',
    style: '玩梗、接梗',
    sampleMessages: [
      '这波啊，这波是经典复刻',
      '主播在第五层',
      'yyds！'
    ]
  },
  {
    id: 'qianshui',
    name: '潜水员',
    description: '平时不说话，关键时刻神评论',
    style: '神评论、精准',
    sampleMessages: [
      '主播，你麦克风没关',
      '前方高能',
      '这波我站主播'
    ]
  }
];

// ==================== 热搜类型 ====================

/**
 * 热搜条目
 */
export interface HotSearch {
  id: string;
  keyword: string;
  heat: string;
  hotComment: string;
  timestamp: number;
}

// ==================== 结局类型 ====================

/**
 * 结局类型
 */
export type EndingType = 
  | 'reconciliation'  // 自我和解
  | 'lost'            // 困于虚拟
  | 'escape'          // 逃离网络
  | 'collapse'        // 双向崩塌
  | 'redemption';     // 双向救赎

/**
 * 结局定义
 */
export interface Ending {
  id: EndingType;
  name: string;
  description: string;
  condition: (state: PlayerState) => boolean;
  story: string;
}

// ==================== 游戏配置类型 ====================

/**
 * 游戏配置
 */
export interface GameConfig {
  totalDays: number;
  dailyExpenses: DailyExpense[];
  npcs: Record<keyof NPCRelations, NPC>;
  personalities: DanmakuPersonality[];
  endings: Ending[];
}

// ==================== 场景类型 ====================

/**
 * 场景类型
 */
export type SceneType = 
  | 'start'      // 开始场景
  | 'mainHub'    // 主界面
  | 'livestream' // 直播场景
  | 'event'      // 事件场景
  | 'summary'    // 结算场景
  | 'ending';    // 结局场景

/**
 * 场景接口
 */
export interface Scene {
  type: SceneType;
  render(): void;
  destroy(): void;
}

// ==================== 状态变化事件 ====================

/**
 * 状态变化事件详情
 */
export interface StateChangeEvent {
  key: keyof PlayerState;
  oldValue: any;
  newValue: any;
}

// ==================== 工具类型 ====================

/**
 * 异步结果
 */
export interface AsyncResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * 数值范围
 */
export interface Range {
  min: number;
  max: number;
}

/**
 * 坐标
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 尺寸
 */
export interface Size {
  width: number;
  height: number;
}
