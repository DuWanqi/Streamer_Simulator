export interface UnlockCondition {
  requiredNodes: string[];
  minFollowers?: number;
  requiredTasks?: string[];
  cost?: number;
}

export interface SkillNode {
  id: string;
  name: string;
  icon: string;
  tier: number;
  dimensionId: string;
  description: string;
  unlockCondition: UnlockCondition;
}

export interface SkillDimension {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  gradientColor: string;
  position: { x: number; y: number };
}

export const DIMENSIONS: SkillDimension[] = [
  {
    id: "eloquence",
    name: "口才",
    subtitle: "嘴炮输出营",
    icon: "💬",
    color: "#ff69b4",
    gradientColor: "#ffb6c1",
    position: { x: 18, y: 35 },
  },
  {
    id: "appearance",
    name: "外貌",
    subtitle: "颜值buff馆",
    icon: "✨",
    color: "#ffa07a",
    gradientColor: "#ffdab9",
    position: { x: 82, y: 35 },
  },
  {
    id: "talent",
    name: "才艺",
    subtitle: "内容整活局",
    icon: "🎮",
    color: "#da70d6",
    gradientColor: "#e6b3e6",
    position: { x: 18, y: 72 },
  },
  {
    id: "knowledge",
    name: "知识",
    subtitle: "避坑生存课",
    icon: "⚠️",
    color: "#87ceeb",
    gradientColor: "#b0e0e6",
    position: { x: 82, y: 72 },
  },
];

export const SKILL_NODES: SkillNode[] = [
  // ==================== 口才维度 · 嘴炮输出营 ====================
  // 基础层
  {
    id: "eloquence_basic_1",
    name: "嘴瓢急救术",
    icon: "💬",
    tier: 1,
    dimensionId: "eloquence",
    description:
      "直播话术流畅度+20%，减少口误，初始吸粉速度提升15%；解锁基础互动话术",
    unlockCondition: { requiredNodes: [], minFollowers: 0, cost: 1 },
  },
  {
    id: "eloquence_basic_2",
    name: "情绪开关",
    icon: "😊",
    tier: 1,
    dimensionId: "eloquence",
    description: "可快速调动直播情绪，粉丝留存率+10%；解锁粉丝安抚能力",
    unlockCondition: { requiredNodes: [], minFollowers: 0, cost: 1 },
  },
  // 进阶层
  {
    id: "eloquence_adv_1",
    name: "反黑嘴替",
    icon: "🛡️",
    tier: 2,
    dimensionId: "eloquence",
    description: "可针对性回应黑粉攻击，降低网暴负面影响15%",
    unlockCondition: {
      requiredNodes: ["eloquence_basic_1", "eloquence_basic_2"],
      minFollowers: 1000,
      cost: 2,
    },
  },
  {
    id: "eloquence_adv_2",
    name: "带货嘴功",
    icon: "🛒",
    tier: 2,
    dimensionId: "eloquence",
    description: "解锁直播带货能力，带货话术转化率+20%",
    unlockCondition: {
      requiredNodes: ["eloquence_basic_1", "eloquence_basic_2"],
      minFollowers: 1000,
      cost: 2,
    },
  },
  // 终极层
  {
    id: "eloquence_ultimate_1",
    name: "嘴炮天花板",
    icon: "👑",
    tier: 3,
    dimensionId: "eloquence",
    description: "话术自动适配场景，粉丝转化率+35%，网暴抗性+30%",
    unlockCondition: {
      requiredNodes: ["eloquence_adv_1", "eloquence_adv_2"],
      cost: 3,
    },
  },
  {
    id: "eloquence_ultimate_2",
    name: "粉丝动员术",
    icon: "📣",
    tier: 3,
    dimensionId: "eloquence",
    description: "引导粉丝参与线索收集，解锁神秘群聊准入资格",
    unlockCondition: {
      requiredNodes: ["eloquence_adv_1", "eloquence_adv_2"],
      cost: 3,
    },
  },

  // ==================== 外貌维度 · 颜值buff馆 ====================
  // 基础层
  {
    id: "appearance_basic_1",
    name: "颜值打底术",
    icon: "✨",
    tier: 1,
    dimensionId: "appearance",
    description: "外貌评分+20，初始吸粉速度提升20%",
    unlockCondition: { requiredNodes: [], cost: 1 },
  },
  {
    id: "appearance_basic_2",
    name: "镜头显眼包",
    icon: "📸",
    tier: 1,
    dimensionId: "appearance",
    description: "镜头表现力+15，粉丝停留时长+10%",
    unlockCondition: { requiredNodes: [], cost: 1 },
  },
  // 进阶层
  {
    id: "appearance_adv_1",
    name: "风格切换器",
    icon: "🎭",
    tier: 2,
    dimensionId: "appearance",
    description: "解锁多种直播风格形象，外貌评分+30",
    unlockCondition: {
      requiredNodes: ["appearance_basic_1", "appearance_basic_2"],
      minFollowers: 5000,
      cost: 2,
    },
  },
  {
    id: "appearance_adv_2",
    name: "开盒防护盾",
    icon: "🔒",
    tier: 2,
    dimensionId: "appearance",
    description: "降低被开盒风险20%，隐藏个人基础信息",
    unlockCondition: {
      requiredNodes: ["appearance_basic_1", "appearance_basic_2"],
      minFollowers: 5000,
      cost: 2,
    },
  },
  // 终极层
  {
    id: "appearance_ultimate_1",
    name: "流量颜值王",
    icon: "💖",
    tier: 3,
    dimensionId: "appearance",
    description: "外貌评分拉满，推荐权重+40%，粉丝增长翻倍",
    unlockCondition: {
      requiredNodes: ["appearance_adv_1", "appearance_adv_2"],
      cost: 3,
    },
  },
  {
    id: "appearance_ultimate_2",
    name: "身份隐身术",
    icon: "👤",
    tier: 3,
    dimensionId: "appearance",
    description: "完全隐藏真实形象，规避开盒风险",
    unlockCondition: {
      requiredNodes: ["appearance_adv_1", "appearance_adv_2"],
      cost: 3,
    },
  },

  // ==================== 才艺维度 · 内容整活局 ====================
  // 基础层（三个可选初始方向）
  {
    id: "talent_basic_1",
    name: "游戏入门仔",
    icon: "🎮",
    tier: 1,
    dimensionId: "talent",
    description: "游戏操作+20，游戏直播内容质量提升15%",
    unlockCondition: { requiredNodes: [], cost: 1 },
  },
  {
    id: "talent_basic_2",
    name: "才艺小萌新",
    icon: "🎤",
    tier: 1,
    dimensionId: "talent",
    description: "唱歌/跳舞基础能力+20，娱乐内容质量提升15%",
    unlockCondition: { requiredNodes: [], cost: 1 },
  },
  {
    id: "talent_basic_3",
    name: "整活小萌新",
    icon: "😂",
    tier: 1,
    dimensionId: "talent",
    description: "解锁基础整活技能，直播趣味性+20%",
    unlockCondition: { requiredNodes: [], cost: 1 },
  },
  // 进阶层
  {
    id: "talent_adv_1",
    name: "游戏大神手",
    icon: "🏆",
    tier: 2,
    dimensionId: "talent",
    description: "游戏操作+40，游戏粉丝留存率+30%",
    unlockCondition: {
      requiredNodes: ["talent_basic_1"],
      minFollowers: 3000,
      cost: 2,
    },
  },
  {
    id: "talent_adv_2",
    name: "才艺显眼包",
    icon: "🌟",
    tier: 2,
    dimensionId: "talent",
    description: "唱歌/跳舞能力+40，娱乐粉丝留存率+30%",
    unlockCondition: {
      requiredNodes: ["talent_basic_2"],
      minFollowers: 3000,
      cost: 2,
    },
  },
  {
    id: "talent_adv_3",
    name: "内容缝合怪",
    icon: "🔗",
    tier: 2,
    dimensionId: "talent",
    description: "将多种内容结合，粉丝多样性+25%",
    unlockCondition: {
      requiredNodes: ["talent_basic_1", "talent_basic_2"],
      minFollowers: 3000,
      cost: 2,
    },
  },
  {
    id: "talent_adv_4",
    name: "狠活小能手",
    icon: "🔥",
    tier: 2,
    dimensionId: "talent",
    description: "解锁中度整活技能，直播热度+35%",
    unlockCondition: {
      requiredNodes: ["talent_basic_3"],
      minFollowers: 3000,
      cost: 2,
    },
  },
  // 终极层
  {
    id: "talent_ultimate_1",
    name: "游戏天花板",
    icon: "🎯",
    tier: 3,
    dimensionId: "talent",
    description: "游戏操作拉满，流量曝光翻倍",
    unlockCondition: {
      requiredNodes: ["talent_adv_1", "talent_adv_3"],
      cost: 3,
    },
  },
  {
    id: "talent_ultimate_2",
    name: "才艺卷王",
    icon: "💃",
    tier: 3,
    dimensionId: "talent",
    description: "才艺能力拉满，粉丝忠诚度+40%",
    unlockCondition: {
      requiredNodes: ["talent_adv_2"],
      cost: 3,
    },
  },
  {
    id: "talent_ultimate_3",
    name: "整活狠活天花板",
    icon: "💥",
    tier: 3,
    dimensionId: "talent",
    description: "解锁高热度整活技能，全网热度+50%",
    unlockCondition: {
      requiredNodes: ["talent_adv_3", "talent_adv_4"],
      cost: 3,
    },
  },

  // ==================== 知识维度 · 避坑生存课 ====================
  // 基础层
  {
    id: "knowledge_basic_1",
    name: "平台避雷指南",
    icon: "⚠️",
    tier: 1,
    dimensionId: "knowledge",
    description: "了解平台规则，违规风险降低20%",
    unlockCondition: { requiredNodes: [], cost: 1 },
  },
  {
    id: "knowledge_basic_2",
    name: "谣言过滤器",
    icon: "🔍",
    tier: 1,
    dimensionId: "knowledge",
    description: "分辨基础真假信息，减少被谣言误导概率",
    unlockCondition: { requiredNodes: [], cost: 1 },
  },
  // 进阶层
  {
    id: "knowledge_adv_1",
    name: "黑料鉴别师",
    icon: "🕵️",
    tier: 2,
    dimensionId: "knowledge",
    description: "分辨黑料与谣言真假，破解率+35%",
    unlockCondition: {
      requiredNodes: ["knowledge_basic_1", "knowledge_basic_2"],
      cost: 2,
    },
  },
  {
    id: "knowledge_adv_2",
    name: "合作排雷术",
    icon: "📋",
    tier: 2,
    dimensionId: "knowledge",
    description: "分辨合作方资质，降低假货风险25%",
    unlockCondition: {
      requiredNodes: ["knowledge_basic_1", "knowledge_basic_2"],
      cost: 2,
    },
  },
  {
    id: "knowledge_adv_3",
    name: "线索挖掘机",
    icon: "🧩",
    tier: 2,
    dimensionId: "knowledge",
    description: "串联零散线索分析，解谜效率+30%",
    unlockCondition: {
      requiredNodes: ["knowledge_basic_1", "knowledge_basic_2"],
      cost: 2,
    },
  },
  // 终极层
  {
    id: "knowledge_ultimate_1",
    name: "真相扒手",
    icon: "🔓",
    tier: 3,
    dimensionId: "knowledge",
    description: "溯源网络信息源头，解码网盘链接",
    unlockCondition: {
      requiredNodes: ["knowledge_adv_1", "knowledge_adv_3"],
      cost: 3,
    },
  },
  {
    id: "knowledge_ultimate_2",
    name: "彩蛋解锁师",
    icon: "🎁",
    tier: 3,
    dimensionId: "knowledge",
    description: "解读异常时间信息，触发核心剧情",
    unlockCondition: {
      requiredNodes: ["knowledge_adv_1", "knowledge_adv_2", "knowledge_adv_3"],
      cost: 3,
    },
  },
];

export const SKILL_TREE_CONFIG = { DIMENSIONS, SKILL_NODES };
