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
  position: { x: number; y: number };
  svgIcon: string;
  gradientFrom: string;
  gradientTo: string;
  connections?: string[]; // 连接到其他节点的ID，用于绘制连线
}

export interface SkillDimension {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  gradientColor: string;
  position: { x: number; y: number };
  gradientFrom: string;
  gradientTo: string;
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
    gradientFrom: "#f472b6",
    gradientTo: "#ec4899",
  },
  {
    id: "appearance",
    name: "外貌",
    subtitle: "颜值buff馆",
    icon: "✨",
    color: "#ffa07a",
    gradientColor: "#ffdab9",
    position: { x: 82, y: 35 },
    gradientFrom: "#fb7185",
    gradientTo: "#e11d48",
  },
  {
    id: "talent",
    name: "才艺",
    subtitle: "内容整活局",
    icon: "🎮",
    color: "#da70d6",
    gradientColor: "#e6b3e6",
    position: { x: 18, y: 72 },
    gradientFrom: "#c084fc",
    gradientTo: "#a855f7",
  },
  {
    id: "knowledge",
    name: "知识",
    subtitle: "避坑生存课",
    icon: "⚠️",
    color: "#87ceeb",
    gradientColor: "#b0e0e6",
    position: { x: 82, y: 72 },
    gradientFrom: "#60a5fa",
    gradientTo: "#3b82f6",
  },
];

const SVG_ICONS: Record<string, string> = {
  messageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  shoppingCart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  crown: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  userCheck: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  drama: '<path d="M14 22v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M18 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M6 20v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M6 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>',
  gamepad2: '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
  mic2: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  micVocal: '<path d="m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12"/><path d="M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5"/><circle cx="16" cy="7" r="5"/>',
  alertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y2="17"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/>',
  eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.475 1 1 0 0 1 0 .898 10.743 10.743 0 0 1-11.205 6.475"/><path d="M14.884 14.884a3 3 0 1 1-4.242-4.242"/><path d="M17.337 6.663a10.744 10.744 0 0 1-11.204 6.475 10.743 10.743 0 0 1-11.205-6.475 1 1 0 0 1 0-.898 10.744 10.744 0 0 1 11.205-6.475"/><path d="M9.116 9.116a3 3 0 1 0 4.242 4.242"/>',
  clipboardCheck: '<path d="M15 2H9a1 1 0 0 0-1 1v1"/><path d="M15 2h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M15 2v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V2"/><rect width="8" height="10" x="5" y="7" rx="1"/><path d="m9 11 1 1 2-2"/>',
  puzzle: '<path d="M19.439 7.85c-.049.322.079.641.308.878a2.5 2.5 0 0 0 3.564-.004c.6-.605.635-1.563.081-2.126L19.4 4.6a1.497 1.497 0 0 0-2.12 0l-2.992 2.99a1.497 1.497 0 0 0 0 2.12l1.06 1.062"/><path d="M4.561 16.15c.049-.322-.079-.641-.308-.878a2.5 2.5 0 0 0-3.564.004c-.6.605-.635-1.563-.081-2.126L4.6 19.4a1.497 1.497 0 0 0 2.12 0l2.992-2.99a1.497 1.497 0 0 0 0-2.12L8.652 13.23"/><path d="m15.448 13.232-2.699 2.699a1.497 1.497 0 0 1-2.12 0l-2.57-2.568a1.497 1.497 0 0 1 0-2.12l2.699-2.699a1.497 1.497 0 0 1 2.12 0l2.57 2.568a1.497 1.497 0 0 1 0 2.12"/><path d="M12 12v4.5"/><path d="M12 7.5V12"/><path d="M7.5 12H12"/><path d="M16.5 12H12"/>',
  keyRound: '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" x2="12" y1="22" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
};

function makeSvg(iconKey: string): string {
  const paths = SVG_ICONS[iconKey] || SVG_ICONS.sparkles;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${paths}</svg>`;
}

// 树状布局设计：每个维度独立页面，内部采用树状层级结构
// 位置坐标是相对于该维度页面的百分比 (0-100)
// 赛博朋克2077风格的分页树状布局
// 每个维度一页，内部节点呈树状排列
// 布局结构（每页独立）：
//       [根节点] (Tier 1)
//       /      \
//   [节点1]  [节点2] (Tier 2)
//    /   \    /   \
// [终1] [终2] [终3] (Tier 3)

export const SKILL_NODES: SkillNode[] = [
  // ==================== 口才维度 · 嘴炮输出营 ====================
  // 基础层 - 根节点
  {
    id: "eloquence_basic_1",
    name: "嘴瓢急救术",
    icon: "💬",
    tier: 1,
    dimensionId: "eloquence",
    description: "直播话术流畅度+20%，减少口误，初始吸粉速度提升15%；解锁基础互动话术",
    unlockCondition: { requiredNodes: [], minFollowers: 0, cost: 1 },
    position: { x: 50, y: 15 },
    svgIcon: makeSvg("messageCircle"),
    gradientFrom: "#f472b6",
    gradientTo: "#ec4899",
    connections: ["eloquence_basic_2"],
  },
  {
    id: "eloquence_basic_2",
    name: "情绪开关",
    icon: "😊",
    tier: 1,
    dimensionId: "eloquence",
    description: "可快速调动直播情绪，粉丝留存率+10%；解锁粉丝安抚能力",
    unlockCondition: { requiredNodes: ["eloquence_basic_1"], minFollowers: 0, cost: 1 },
    position: { x: 50, y: 30 },
    svgIcon: makeSvg("smile"),
    gradientFrom: "#fb923c",
    gradientTo: "#f97316",
    connections: ["eloquence_adv_1", "eloquence_adv_2"],
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
      requiredNodes: ["eloquence_basic_2"],
      minFollowers: 1000,
      cost: 2,
    },
    position: { x: 30, y: 50 },
    svgIcon: makeSvg("shield"),
    gradientFrom: "#a78bfa",
    gradientTo: "#8b5cf6",
    connections: ["eloquence_ultimate_1"],
  },
  {
    id: "eloquence_adv_2",
    name: "带货嘴功",
    icon: "🛒",
    tier: 2,
    dimensionId: "eloquence",
    description: "解锁直播带货能力，带货话术转化率+20%",
    unlockCondition: {
      requiredNodes: ["eloquence_basic_2"],
      minFollowers: 1000,
      cost: 2,
    },
    position: { x: 70, y: 50 },
    svgIcon: makeSvg("shoppingCart"),
    gradientFrom: "#fbbf24",
    gradientTo: "#f59e0b",
    connections: ["eloquence_ultimate_2"],
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
      requiredNodes: ["eloquence_adv_1"],
      cost: 3,
    },
    position: { x: 30, y: 75 },
    svgIcon: makeSvg("crown"),
    gradientFrom: "#fbbf24",
    gradientTo: "#d97706",
  },
  {
    id: "eloquence_ultimate_2",
    name: "粉丝动员术",
    icon: "📣",
    tier: 3,
    dimensionId: "eloquence",
    description: "引导粉丝参与线索收集，解锁神秘群聊准入资格",
    unlockCondition: {
      requiredNodes: ["eloquence_adv_2"],
      cost: 3,
    },
    position: { x: 70, y: 75 },
    svgIcon: makeSvg("megaphone"),
    gradientFrom: "#f472b6",
    gradientTo: "#db2777",
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
    position: { x: 50, y: 15 },
    svgIcon: makeSvg("sparkles"),
    gradientFrom: "#f472b6",
    gradientTo: "#ec4899",
    connections: ["appearance_basic_2"],
  },
  {
    id: "appearance_basic_2",
    name: "镜头显眼包",
    icon: "📸",
    tier: 1,
    dimensionId: "appearance",
    description: "镜头表现力+15，粉丝停留时长+10%",
    unlockCondition: { requiredNodes: ["appearance_basic_1"], cost: 1 },
    position: { x: 50, y: 30 },
    svgIcon: makeSvg("camera"),
    gradientFrom: "#60a5fa",
    gradientTo: "#3b82f6",
    connections: ["appearance_adv_1", "appearance_adv_2"],
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
      requiredNodes: ["appearance_basic_2"],
      minFollowers: 5000,
      cost: 2,
    },
    position: { x: 30, y: 50 },
    svgIcon: makeSvg("drama"),
    gradientFrom: "#c084fc",
    gradientTo: "#a855f7",
    connections: ["appearance_ultimate_1"],
  },
  {
    id: "appearance_adv_2",
    name: "开盒防护盾",
    icon: "🔒",
    tier: 2,
    dimensionId: "appearance",
    description: "降低被开盒风险20%，隐藏个人基础信息",
    unlockCondition: {
      requiredNodes: ["appearance_basic_2"],
      minFollowers: 5000,
      cost: 2,
    },
    position: { x: 70, y: 50 },
    svgIcon: makeSvg("shield"),
    gradientFrom: "#34d399",
    gradientTo: "#10b981",
    connections: ["appearance_ultimate_2"],
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
      requiredNodes: ["appearance_adv_1"],
      cost: 3,
    },
    position: { x: 30, y: 75 },
    svgIcon: makeSvg("heart"),
    gradientFrom: "#fb7185",
    gradientTo: "#e11d48",
  },
  {
    id: "appearance_ultimate_2",
    name: "身份隐身术",
    icon: "👤",
    tier: 3,
    dimensionId: "appearance",
    description: "完全隐藏真实形象，规避开盒风险",
    unlockCondition: {
      requiredNodes: ["appearance_adv_2"],
      cost: 3,
    },
    position: { x: 70, y: 75 },
    svgIcon: makeSvg("userCheck"),
    gradientFrom: "#94a3b8",
    gradientTo: "#64748b",
  },

  // ==================== 才艺维度 · 内容整活局 ====================
  // 基础层 - 3个分支起点
  {
    id: "talent_basic_1",
    name: "游戏入门仔",
    icon: "🎮",
    tier: 1,
    dimensionId: "talent",
    description: "游戏操作+20，游戏直播内容质量提升15%",
    unlockCondition: { requiredNodes: [], cost: 1 },
    position: { x: 20, y: 15 },
    svgIcon: makeSvg("gamepad2"),
    gradientFrom: "#60a5fa",
    gradientTo: "#0ea5e9",
    connections: ["talent_adv_1"],
  },
  {
    id: "talent_basic_2",
    name: "才艺小萌新",
    icon: "🎤",
    tier: 1,
    dimensionId: "talent",
    description: "唱歌/跳舞基础能力+20，娱乐内容质量提升15%",
    unlockCondition: { requiredNodes: [], cost: 1 },
    position: { x: 50, y: 15 },
    svgIcon: makeSvg("mic2"),
    gradientFrom: "#f472b6",
    gradientTo: "#ec4899",
    connections: ["talent_adv_2"],
  },
  {
    id: "talent_basic_3",
    name: "整活小萌新",
    icon: "😂",
    tier: 1,
    dimensionId: "talent",
    description: "解锁基础整活技能，直播趣味性+20%",
    unlockCondition: { requiredNodes: [], cost: 1 },
    position: { x: 80, y: 15 },
    svgIcon: makeSvg("zap"),
    gradientFrom: "#fbbf24",
    gradientTo: "#f59e0b",
    connections: ["talent_adv_4"],
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
    position: { x: 20, y: 40 },
    svgIcon: makeSvg("trophy"),
    gradientFrom: "#6366f1",
    gradientTo: "#4f46e5",
    connections: ["talent_ultimate_1"],
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
    position: { x: 50, y: 40 },
    svgIcon: makeSvg("music"),
    gradientFrom: "#f472b6",
    gradientTo: "#db2777",
    connections: ["talent_ultimate_2"],
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
    position: { x: 35, y: 55 },
    svgIcon: makeSvg("link"),
    gradientFrom: "#a78bfa",
    gradientTo: "#8b5cf6",
    connections: ["talent_ultimate_1"],
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
    position: { x: 80, y: 40 },
    svgIcon: makeSvg("flame"),
    gradientFrom: "#fb923c",
    gradientTo: "#ea580c",
    connections: ["talent_ultimate_3"],
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
    position: { x: 27, y: 75 },
    svgIcon: makeSvg("target"),
    gradientFrom: "#6366f1",
    gradientTo: "#4338ca",
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
    position: { x: 50, y: 75 },
    svgIcon: makeSvg("star"),
    gradientFrom: "#fbbf24",
    gradientTo: "#d97706",
  },
  {
    id: "talent_ultimate_3",
    name: "整活狠活天花板",
    icon: "💥",
    tier: 3,
    dimensionId: "talent",
    description: "解锁高热度整活技能，全网热度+50%",
    unlockCondition: {
      requiredNodes: ["talent_adv_4"],
      cost: 3,
    },
    position: { x: 80, y: 75 },
    svgIcon: makeSvg("flame"),
    gradientFrom: "#ef4444",
    gradientTo: "#dc2626",
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
    position: { x: 50, y: 15 },
    svgIcon: makeSvg("alertTriangle"),
    gradientFrom: "#fbbf24",
    gradientTo: "#f59e0b",
    connections: ["knowledge_basic_2"],
  },
  {
    id: "knowledge_basic_2",
    name: "谣言过滤器",
    icon: "🔍",
    tier: 1,
    dimensionId: "knowledge",
    description: "分辨基础真假信息，减少被谣言误导概率",
    unlockCondition: { requiredNodes: ["knowledge_basic_1"], cost: 1 },
    position: { x: 50, y: 30 },
    svgIcon: makeSvg("search"),
    gradientFrom: "#60a5fa",
    gradientTo: "#3b82f6",
    connections: ["knowledge_adv_1", "knowledge_adv_2", "knowledge_adv_3"],
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
      requiredNodes: ["knowledge_basic_2"],
      cost: 2,
    },
    position: { x: 20, y: 50 },
    svgIcon: makeSvg("eyeOff"),
    gradientFrom: "#a78bfa",
    gradientTo: "#8b5cf6",
    connections: ["knowledge_ultimate_1"],
  },
  {
    id: "knowledge_adv_2",
    name: "合作排雷术",
    icon: "📋",
    tier: 2,
    dimensionId: "knowledge",
    description: "分辨合作方资质，降低假货风险25%",
    unlockCondition: {
      requiredNodes: ["knowledge_basic_2"],
      cost: 2,
    },
    position: { x: 50, y: 50 },
    svgIcon: makeSvg("clipboardCheck"),
    gradientFrom: "#34d399",
    gradientTo: "#10b981",
    connections: ["knowledge_ultimate_2"],
  },
  {
    id: "knowledge_adv_3",
    name: "线索挖掘机",
    icon: "🧩",
    tier: 2,
    dimensionId: "knowledge",
    description: "串联零散线索分析，解谜效率+30%",
    unlockCondition: {
      requiredNodes: ["knowledge_basic_2"],
      cost: 2,
    },
    position: { x: 80, y: 50 },
    svgIcon: makeSvg("puzzle"),
    gradientFrom: "#f472b6",
    gradientTo: "#ec4899",
    connections: ["knowledge_ultimate_2"],
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
      requiredNodes: ["knowledge_adv_1"],
      cost: 3,
    },
    position: { x: 20, y: 75 },
    svgIcon: makeSvg("keyRound"),
    gradientFrom: "#6366f1",
    gradientTo: "#4f46e5",
  },
  {
    id: "knowledge_ultimate_2",
    name: "彩蛋解锁师",
    icon: "🎁",
    tier: 3,
    dimensionId: "knowledge",
    description: "解读异常时间信息，触发核心剧情",
    unlockCondition: {
      requiredNodes: ["knowledge_adv_2", "knowledge_adv_3"],
      cost: 3,
    },
    position: { x: 65, y: 75 },
    svgIcon: makeSvg("gift"),
    gradientFrom: "#fbbf24",
    gradientTo: "#d97706",
  },
];

export const SKILL_TREE_CONFIG = { DIMENSIONS, SKILL_NODES };
