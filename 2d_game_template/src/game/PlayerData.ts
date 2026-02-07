/**
 * 玩家数据模型
 */

import { STAGES, ATTRIBUTES, INITIAL_VALUES, MAX_UPGRADES_PER_DAY, type StreamCategory, type AttributeType, type StageInfo } from './GameConfig';

export interface PlayerState {
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
}

export class PlayerData {
  private state: PlayerState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): PlayerState {
    return {
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

  advanceDay(): void {
    this.state.currentDay++;
    this.state.dailyUpgrades = { appearance: 0, knowledge: 0, fame: 0, talent: 0 };
    this.state.hasFinishedUpgrade = false;
    this.state.streamContent = '';
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
