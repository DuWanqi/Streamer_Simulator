/**
 * 玩家数据模型
 */

import { STAGES, ATTRIBUTES, INITIAL_VALUES, MAX_UPGRADES_PER_DAY, type StreamCategory, type AttributeType, type StageInfo } from './GameConfig';

// NPC关系类型
export interface NPCRelations {
  landlady: number;  // 房东太太
  kexin: number;     // 可心
  mom: number;       // 妈妈
  doudou: number;    // 豆豆
  yueya: number;     // 月牙儿
  harasser: number;  // 猥琐男
}

// 生存支付状态
export interface SurvivalState {
  rentDue: number;       // 房租拖欠天数
  utilitiesDue: number;  // 水电拖欠天数
  foodDays: number;      // 连续未吃食物天数
  internetDue: number;   // 网费拖欠天数
}

export interface PlayerState {
  // 原有字段
  followers: number;
  fanClub: number;
  income: number;
  level: number;
  exp: number;
  stageId: number;
  appearance: number;
  knowledge: number;
  fame: number;
  talent: number;
  dailyUpgrades: Record<AttributeType, number>;
  category: StreamCategory | null;
  currentDay: number;
  hasFinishedUpgrade: boolean;
  streamContent: string;
  apiKey: string;
  skillPoints: number;
  unlockedNodes: string[];
  totalSkillPointsEarned: number;
  
  // 双面人生新增字段
  sanity: number;              // 精神值 0-100
  personaIntegrity: number;    // 人设完整度 0-100
  kindness: number;            // 善良值 0-100
  integrity: number;           // 诚信值 0-100
  failCount: number;           // 翻车次数
  
  // NPC好感度
  npcRelations: NPCRelations;
  
  // 生存支付状态
  survival: SurvivalState;
  
  // 游戏记录
  trendingTopics: string[];                    // 热搜历史
  storyChoices: Record<string, string>;        // 剧情节点选择记录
  dailyEventsLog: string[];                    // 每日事件日志
}

export class PlayerData {
  private state: PlayerState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): PlayerState {
    return {
      // 原有字段
      followers: INITIAL_VALUES.followers,
      fanClub: INITIAL_VALUES.fanClub,
      income: INITIAL_VALUES.income,
      level: INITIAL_VALUES.level,
      exp: 0,
      stageId: 1,
      appearance: INITIAL_VALUES.appearance,
      knowledge: INITIAL_VALUES.knowledge,
      fame: INITIAL_VALUES.fame,
      talent: INITIAL_VALUES.talent,
      dailyUpgrades: { appearance: 0, knowledge: 0, fame: 0, talent: 0 },
      category: null,
      currentDay: 1,
      hasFinishedUpgrade: false,
      streamContent: '',
      apiKey: '',
      skillPoints: 20,
      unlockedNodes: [],
      totalSkillPointsEarned: 20,
      
      // 双面人生新增字段 - 初始值
      sanity: 80,                    // 精神值初始80
      personaIntegrity: 100,         // 人设完整度初始100
      kindness: 50,                  // 善良值初始50
      integrity: 50,                 // 诚信值初始50
      failCount: 0,                  // 翻车次数初始0
      
      // NPC好感度初始值（根据设计案）
      npcRelations: {
        landlady: 30,    // 房东太太初始30
        kexin: 80,       // 可心初始80
        mom: 40,         // 妈妈初始40
        doudou: 0,       // 豆豆初始0（第6天才会遇到）
        yueya: 20,       // 月牙儿初始20
        harasser: 10,    // 猥琐男初始10
      },
      
      // 生存支付状态初始值
      survival: {
        rentDue: 0,       // 房租不拖欠
        utilitiesDue: 0,  // 水电不拖欠
        foodDays: 0,      // 没有连续不吃
        internetDue: 0,   // 网费不拖欠
      },
      
      // 游戏记录初始值
      trendingTopics: [],
      storyChoices: {},
      dailyEventsLog: [],
    };
  }

  reset(): void {
    this.state = this.createInitialState();
    this.notify();
  }

  getState(): Readonly<PlayerState> {
    return { ...this.state };
  }

  getStage(): StageInfo {
    return STAGES.find(s => s.id === this.state.stageId) || STAGES[0];
  }

  getStageIndex(): number {
    return this.state.stageId - 1;
  }

  setCategory(category: StreamCategory): void {
    this.state.category = category;
    this.notify();
  }

  setApiKey(key: string): void {
    this.state.apiKey = key;
    this.notify();
  }

  setStreamContent(content: string): void {
    this.state.streamContent = content;
  }

  canUpgradeAttribute(type: AttributeType): { canUpgrade: boolean; cost: number; reason?: string } {
    const config = ATTRIBUTES.find(a => a.type === type)!;
    const stageIndex = this.getStageIndex();
    const cost = config.costs[stageIndex];
    const dailyCount = this.state.dailyUpgrades[type];

    if (dailyCount >= MAX_UPGRADES_PER_DAY) {
      return { canUpgrade: false, cost, reason: '今日该属性已达升级上限' };
    }
    if (this.state.income < cost) {
      return { canUpgrade: false, cost, reason: '收入不足' };
    }
    return { canUpgrade: true, cost };
  }

  upgradeAttribute(type: AttributeType): boolean {
    const check = this.canUpgradeAttribute(type);
    if (!check.canUpgrade) return false;

    this.state.income -= check.cost;
    this.state[type] += 1;
    this.state.dailyUpgrades[type] += 1;
    this.notify();
    return true;
  }

  finishUpgrade(): void {
    this.state.hasFinishedUpgrade = true;
    this.notify();
  }

  addFollowers(amount: number): void {
    this.state.followers = Math.max(0, this.state.followers + amount);
    this.notify();
  }

  addFanClub(amount: number): void {
    this.state.fanClub = Math.max(0, this.state.fanClub + amount);
    this.notify();
  }

  addIncome(amount: number): void {
    this.state.income = Math.round(Math.max(0, this.state.income + amount));
    this.notify();
  }

  addExp(amount: number): void {
    this.state.exp += amount;
    while (this.state.exp >= this.getExpForNextLevel()) {
      this.state.exp -= this.getExpForNextLevel();
      this.levelUp();
    }
    this.notify();
  }

  private getExpForNextLevel(): number {
    return 100 + this.state.level * 20;
  }

  private levelUp(): void {
    this.state.level++;
    const newStage = STAGES.find(s => this.state.level >= s.minLevel && this.state.level <= s.maxLevel);
    if (newStage && newStage.id !== this.state.stageId) {
      const oldStageId = this.state.stageId;
      this.state.stageId = newStage.id;
      if (newStage.id > oldStageId) {
        this.state.followers = Math.round(this.state.followers * newStage.followerBoost);
        this.state.fanClub = Math.round(this.state.fanClub * newStage.fanClubBoost);
        this.state.income = Math.round(this.state.income * newStage.incomeBoost);
      }
    }
  }

  getSkillPoints(): number {
    return this.state.skillPoints;
  }

  getUnlockedNodes(): readonly string[] {
    return [...this.state.unlockedNodes];
  }

  isNodeUnlocked(nodeId: string): boolean {
    return this.state.unlockedNodes.includes(nodeId);
  }

  spendSkillPoints(amount: number): boolean {
    if (this.state.skillPoints >= amount) {
      this.state.skillPoints -= amount;
      this.notify();
      return true;
    }
    return false;
  }

  unlockNode(nodeId: string): boolean {
    if (this.state.unlockedNodes.includes(nodeId)) return false;
    this.state.unlockedNodes.push(nodeId);
    this.notify();
    return true;
  }

  addSkillPoints(amount: number): void {
    this.state.skillPoints += amount;
    this.state.totalSkillPointsEarned += amount;
    this.notify();
  }

  advanceDay(): void {
    this.state.currentDay++;
    this.state.dailyUpgrades = { appearance: 0, knowledge: 0, fame: 0, talent: 0 };
    this.state.hasFinishedUpgrade = false;
    this.state.streamContent = '';
    this.state.skillPoints += 2;
    this.notify();
  }

  isGameOver(): boolean {
    return this.state.income <= 0;
  }

  isVictory(): boolean {
    return this.state.currentDay > 20;
  }

  getAttributeLevel(type: AttributeType): number {
    return this.state[type];
  }

  getLevelProgress(): number {
    const needed = this.getExpForNextLevel();
    return Math.min(100, Math.round((this.state.exp / needed) * 100));
  }

  static formatNumber(n: number): string {
    if (n >= 100000000) {
      const value = n / 100000000;
      return value % 1 === 0 ? value + '亿' : value.toFixed(1) + '亿';
    }
    if (n >= 10000) {
      const value = n / 10000;
      return value % 1 === 0 ? value + 'w' : value.toFixed(1) + 'w';
    }
    if (n >= 1000) {
      const value = n / 1000;
      return value % 1 === 0 ? value + 'k' : value.toFixed(1) + 'k';
    }
    return Math.floor(n).toString();
  }

  static formatMoney(n: number): string {
    if (n >= 100000000) {
      const value = n / 100000000;
      return '¥' + (value % 1 === 0 ? value : value.toFixed(1)) + '亿';
    }
    if (n >= 10000) {
      const value = n / 10000;
      return '¥' + (value % 1 === 0 ? value : value.toFixed(1)) + 'w';
    }
    return '¥' + Math.floor(n).toLocaleString();
  }

  // 根据阶段计算直播间人数（比关注量低，符合中国互联网情况）
  static getViewerCount(followers: number, stageId: number): number {
    // 不同阶段的在线率
    // 阶段1-2: 新人和小有名气，在线率较高（粉丝少但活跃）
    // 阶段3: 百大主播 - 关注100-200万，直播间3000-1万+
    // 阶段4: 平台顶流 - 关注200-1000万，直播间5000-2万+
    // 阶段5: 名扬海外 - 关注1000-3000万，直播间1万-3万+
    const viewerRates: Record<number, { min: number; max: number }> = {
      1: { min: 0.05, max: 0.15 },  // 5-15%
      2: { min: 0.02, max: 0.08 },  // 2-8%
      3: { min: 0.003, max: 0.01 }, // 0.3-1% (百大：100万粉→3000-1万)
      4: { min: 0.002, max: 0.005 }, // 0.2-0.5% (顶流：500万粉→1万-2.5万)
      5: { min: 0.001, max: 0.003 }, // 0.1-0.3% (海外：2000万粉→2万-6万)
    };
    
    const rate = viewerRates[stageId] || viewerRates[1];
    const actualRate = rate.min + Math.random() * (rate.max - rate.min);
    let viewers = Math.floor(followers * actualRate);
    
    // 设置最小值确保人数合理
    const minViewers: Record<number, number> = {
      1: 10,
      2: 100,
      3: 3000,
      4: 5000,
      5: 10000,
    };
    
    return Math.max(viewers, minViewers[stageId] || 10);
  }

  // 双面人生新增方法
  
  /**
   * 修改精神值
   */
  addSanity(amount: number): void {
    this.state.sanity = Math.max(0, Math.min(100, this.state.sanity + amount));
    this.notify();
  }
  
  /**
   * 修改人设完整度
   */
  addPersonaIntegrity(amount: number): void {
    this.state.personaIntegrity = Math.max(0, Math.min(100, this.state.personaIntegrity + amount));
    this.notify();
  }
  
  /**
   * 修改善良值
   */
  addKindness(amount: number): void {
    this.state.kindness = Math.max(0, Math.min(100, this.state.kindness + amount));
    this.notify();
  }
  
  /**
   * 修改诚信值
   */
  addIntegrity(amount: number): void {
    this.state.integrity = Math.max(0, Math.min(100, this.state.integrity + amount));
    this.notify();
  }
  
  /**
   * 增加翻车次数
   */
  incrementFailCount(): void {
    this.state.failCount++;
    this.notify();
  }
  
  /**
   * 修改NPC好感度
   */
  addNPCRelation(npcId: keyof NPCRelations, amount: number): void {
    this.state.npcRelations[npcId] = Math.max(0, Math.min(100, this.state.npcRelations[npcId] + amount));
    this.notify();
  }
  
  /**
   * 获取NPC好感度
   */
  getNPCRelation(npcId: keyof NPCRelations): number {
    return this.state.npcRelations[npcId];
  }
  
  /**
   * 修改生存支付状态
   */
  updateSurvival(type: keyof SurvivalState, amount: number): void {
    this.state.survival[type] = Math.max(0, this.state.survival[type] + amount);
    this.notify();
  }
  
  /**
   * 添加热搜
   */
  addTrendingTopic(topic: string): void {
    this.state.trendingTopics.push(topic);
    if (this.state.trendingTopics.length > 10) {
      this.state.trendingTopics.shift(); // 只保留最近10条
    }
    this.notify();
  }
  
  /**
   * 记录剧情选择
   */
  recordStoryChoice(nodeId: string, choiceId: string): void {
    this.state.storyChoices[nodeId] = choiceId;
    this.notify();
  }
  
  /**
   * 添加每日事件日志
   */
  addDailyEventLog(event: string): void {
    this.state.dailyEventsLog.push(`Day ${this.state.currentDay}: ${event}`);
    this.notify();
  }

  onChange(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
