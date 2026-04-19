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

// ==================== 双面人生模式配置 ====================

// 每日固定支出（根据设计案第4章）
export const DAILY_EXPENSES = {
  rent: 100,       // 房租
  utilities: 20,   // 水电费
  food: 30,        // 食物
  internet: 10,    // 网费
  total: 160,      // 每日总支出
};

// 生存危机阈值
export const SURVIVAL_THRESHOLDS = {
  rent: { warning: 7, critical: 10 },      // 拖欠7天警告，10天被驱逐
  utilities: { warning: 2, critical: 3 },  // 拖欠2天警告，3天断水断电
  food: { warning: 1, critical: 2 },       // 1天不吃警告，2天触发饥饿
  internet: { warning: 0, critical: 1 },   // 拖欠1天断网
};

// NPC配置
export interface NPCConfig {
  id: keyof import('./PlayerData').NPCRelations;
  name: string;
  description: string;
  initialRelation: number;
  firstAppearanceDay: number;
}

export const NPCS: NPCConfig[] = [
  { id: 'landlady', name: '房东太太', description: '包租婆，表面严厉其实关心租客', initialRelation: 30, firstAppearanceDay: 1 },
  { id: 'kexin', name: '可心', description: '室友，善良但命运多舛的女孩', initialRelation: 80, firstAppearanceDay: 3 },
  { id: 'mom', name: '妈妈', description: '小爱的母亲，患有阿尔茨海默症', initialRelation: 40, firstAppearanceDay: 20 },
  { id: 'doudou', name: '豆豆', description: '流浪狗，小爱的忠实伙伴', initialRelation: 0, firstAppearanceDay: 6 },
  { id: 'yueya', name: '月牙儿', description: '人气主播，小爱的竞争对手', initialRelation: 20, firstAppearanceDay: 16 },
  { id: 'harasser', name: '猥琐男', description: '合租邻居，对小爱不怀好意', initialRelation: 10, firstAppearanceDay: 11 },
];

// 情绪映射表（立绘文件名映射）
export const EMOTION_MAP: Record<string, string> = {
  'positive': '开心',      // 积极、成功场景
  'happy': '微笑',         // 日常、平静场景
  'nervous': '紧张',       // 压力、焦虑场景
  'scared': '恐惧',        // 危机、害怕场景
  'angry': '生气',         // 愤怒、不公平场景
  'disgusted': '厌恶',     // 反感、恶心场景
  'embarrassed': '尴尬2',  // 翻车、社死场景
  'panicked': '惊慌',      // 突发、紧急场景
  'playful': '顽皮',       // 调皮、恶作剧场景
  'tired': '微笑',         // 疲惫（用微笑代替）
  'default': '微笑'
};

// 立绘路径配置
export const PORTRAIT_PATHS = {
  halfBody: 'prepared_assets/半身像/',
  fullBody: 'prepared_assets/白毛1.3.png',
  expressions: ['厌恶', '尴尬2', '开心', '微笑', '恐惧', '惊慌', '生气', '紧张', '顽皮'],
};

// 弹幕人格配置（8个常驻粉丝）
export interface DanmakuPersonality {
  id: string;
  name: string;
  description: string;
  style: string;
}

export const DANMAKU_PERSONALITIES: DanmakuPersonality[] = [
  { id: '001', name: '老粉阿伟', description: '专门翻旧账', style: '我记得你上次也是这么说的' },
  { id: '002', name: '黑粉头子', description: '氪金黑粉', style: '唱得什么玩意儿（附赠火箭）' },
  { id: '003', name: '翻译君', description: '翻译成奇怪语言', style: '谢主隆恩，吾皇万岁' },
  { id: '004', name: '颜文字怪', description: '只发颜文字', style: '(๑°o°๑) (☆▽☆)' },
  { id: '005', name: '考据党', description: '统计数据', style: '今日翻车3次，累计47次' },
  { id: '006', name: '奶奶粉', description: '温暖但误解梗', style: '是不是有人欺负你？奶奶帮你' },
  { id: '007', name: '梗百科', description: '接梗造梗', style: '主播在第五层' },
  { id: '008', name: '潜水员', description: '平时沉默，关键时刻神评论', style: '主播，你麦克风没关' },
];

// 结局类型
export type EndingType = 'reconciliation' | 'lost' | 'escape' | 'collapse' | 'redemption';

export interface EndingConfig {
  type: EndingType;
  name: string;
  description: string;
}

export const ENDINGS: EndingConfig[] = [
  { type: 'reconciliation', name: '自我和解·回归本真', description: '暂停直播，回老家陪伴妈妈，关掉虚拟形象，粉丝反而更喜欢真实的你' },
  { type: 'lost', name: '困于虚拟·彻底迷失', description: '成为顶级大博主，但失去所有现实牵挂，活成了互联网的傀儡' },
  { type: 'escape', name: '逃离网络·回归现实', description: '意识到网络光鲜都是虚无，停播100天彻底告别主播身份' },
  { type: 'collapse', name: '双向崩塌·彻底沉寂', description: '被赶出出租屋，经济破产，重新沦为无人问津的普通人' },
  { type: 'redemption', name: '真相大白·双向救赎', description: '用真诚收获现实认可与网络喜爱，带着粉丝理解和现实温暖回归' },
];
