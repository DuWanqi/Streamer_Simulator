/**
 * 主播模拟器：双面人生 - 游戏主类
 * 整合所有系统，提供完整的游戏体验
 */

import { logger } from '../core/DebugLogger';
import { ImageProcessor } from '../assets/ImageProcessor';
import type { PlayerState, GameEvent, HotSearch } from '../data/Types';
import { DEFAULT_PLAYER_STATE } from '../data/Types';

import { NPCSystem, createNPCSystem } from '../systems/NPCSystem';
import { SurvivalSystem, getSurvivalSystem } from '../systems/SurvivalSystem';
import { DanmakuSystem, createDanmakuSystem } from '../systems/DanmakuSystem';
import { HotSearchSystem, createHotSearchSystem } from '../systems/HotSearchSystem';
import { CareerSummarySystem, createCareerSummarySystem } from '../systems/CareerSummarySystem';
import { EndingSystem, createEndingSystem } from '../systems/EndingSystem';
import { EventManager, createEventManager } from '../events/EventManager';

import {
  CharacterPortrait,
  DialogBox,
  ChoicePanel,
  StatsPanel,
  DanmakuOverlay,
  HotSearchCard,
  SceneTransition
} from '../ui/components';

export interface GameConfig {
  containerId: string;
  characterBasePath: string;
  onGameEnd?: (ending: any) => void;
}

export class DoubleLifeGame {
  // 游戏状态
  private state: PlayerState;
  private day: number = 1;
  private isRunning: boolean = false;
  
  // 系统实例
  private npcSystem: NPCSystem;
  private survivalSystem: SurvivalSystem;
  private danmakuSystem: DanmakuSystem;
  private hotSearchSystem: HotSearchSystem;
  private careerSummarySystem: CareerSummarySystem;
  private endingSystem: EndingSystem;
  private eventManager: EventManager;
  
  // UI组件
  private portrait: CharacterPortrait | null = null;
  private dialogBox: DialogBox | null = null;
  private choicePanel: ChoicePanel | null = null;
  private statsPanel: StatsPanel | null = null;
  private danmakuOverlay: DanmakuOverlay | null = null;
  private hotSearchCard: HotSearchCard | null = null;
  
  // 游戏记录
  private triggeredEvents: string[] = [];
  private hotSearchHistory: HotSearch[] = [];
  private storyChoices: Record<string, string> = {};

  constructor(private config: GameConfig) {
    // 初始化状态
    this.state = { ...DEFAULT_PLAYER_STATE };
    
    // 初始化系统
    this.npcSystem = createNPCSystem();
    this.survivalSystem = getSurvivalSystem(this.state);
    this.danmakuSystem = createDanmakuSystem();
    this.hotSearchSystem = createHotSearchSystem();
    this.careerSummarySystem = createCareerSummarySystem();
    this.endingSystem = createEndingSystem();
    this.eventManager = createEventManager();
    
    logger.log('info', 'DoubleLifeGame', '游戏主类初始化完成');
  }

  /**
   * 初始化游戏
   */
  async init(): Promise<void> {
    logger.log('info', 'DoubleLifeGame', '开始初始化游戏');
    
    // 初始化UI组件
    this.initUI();
    
    // 预加载角色图片
    try {
      this.portrait = new CharacterPortrait({
        containerId: 'character-portrait',
        basePath: this.config.characterBasePath
      });
      await this.portrait.preloadAll(this.config.characterBasePath);
    } catch (error) {
      logger.log('warn', 'DoubleLifeGame', '角色图片预加载失败', { error });
    }
    
    logger.log('info', 'DoubleLifeGame', '游戏初始化完成');
  }

  /**
   * 初始化UI
   */
  private initUI(): void {
    // 创建游戏容器
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      throw new Error(`容器 #${this.config.containerId} 不存在`);
    }
    
    // 清空并设置容器样式
    container.innerHTML = '';
    container.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%);
      overflow-y: auto;
    `;
    
    // 创建游戏场景
    const gameScene = document.createElement('div');
    gameScene.id = 'game-scene';
    gameScene.style.cssText = `
      min-height: 100vh;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;
    
    gameScene.innerHTML = `
      <div style="
        display: grid;
        grid-template-columns: 280px 1fr 280px;
        gap: 24px;
        width: 100%;
        max-width: 1400px;
      ">
        <!-- 左侧：角色立绘 -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div id="character-portrait" style="
            background: rgba(255,255,255,0.05);
            border-radius: 20px;
            padding: 20px;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="color: #808080; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">👤</div>
              <div>角色立绘加载中...</div>
            </div>
          </div>
        </div>
        
        <!-- 中间：主要内容 -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- 天数显示 -->
          <div id="day-display" style="
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
          ">
            <div style="
              font-size: 28px;
              font-weight: bold;
              background: linear-gradient(135deg, #ffb6c1, #87ceeb);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">
              第 <span id="current-day">1</span> 天
            </div>
          </div>
          
          <!-- 弹幕层 -->
          <div id="danmaku-container" style="
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            height: 150px;
            position: relative;
            overflow: hidden;
          "></div>
          
          <!-- 对话框 -->
          <div id="dialog-container" style="
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 16px;
            padding: 20px;
            min-height: 120px;
          ">
            <div style="color: #ffb6c1; font-weight: 600; margin-bottom: 8px;">系统</div>
            <div style="color: #fff; line-height: 1.6;">欢迎来到双面人生模式...</div>
          </div>
          
          <!-- 选项面板 -->
          <div id="choice-container" style="
            display: flex;
            flex-direction: column;
            gap: 12px;
          "></div>
          
          <!-- 热搜卡片 -->
          <div id="hotsearch-container" style="display: none;"></div>
        </div>
        
        <!-- 右侧：数值面板 -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div id="stats-container" style="
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 16px;
            padding: 20px;
          "></div>
        </div>
      </div>
    `;
    
    container.appendChild(gameScene);
    
    // 初始化UI组件（带错误处理）
    try {
      this.dialogBox = new DialogBox('dialog-container');
    } catch (e) {
      logger.log('warn', 'DoubleLifeGame', 'DialogBox初始化失败', { error: e });
    }
    
    try {
      this.choicePanel = new ChoicePanel('choice-container');
    } catch (e) {
      logger.log('warn', 'DoubleLifeGame', 'ChoicePanel初始化失败', { error: e });
    }
    
    try {
      this.statsPanel = new StatsPanel({ containerId: 'stats-container' });
      this.statsPanel.updateStats(this.state);
    } catch (e) {
      logger.log('warn', 'DoubleLifeGame', 'StatsPanel初始化失败', { error: e });
    }
    
    try {
      this.danmakuOverlay = new DanmakuOverlay({ containerId: 'danmaku-container' });
    } catch (e) {
      logger.log('warn', 'DoubleLifeGame', 'DanmakuOverlay初始化失败', { error: e });
    }
    
    try {
      this.hotSearchCard = new HotSearchCard({ containerId: 'hotsearch-container' });
    } catch (e) {
      logger.log('warn', 'DoubleLifeGame', 'HotSearchCard初始化失败', { error: e });
    }
    
    logger.log('info', 'DoubleLifeGame', 'UI初始化完成');
  }

  /**
   * 开始游戏
   */
  async start(): Promise<void> {
    this.isRunning = true;
    logger.log('info', 'DoubleLifeGame', '游戏开始');
    
    // 显示开场
    await this.showOpening();
    
    // 开始第一天
    await this.startDay();
  }

  /**
   * 显示开场
   */
  private async showOpening(): Promise<void> {
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: '系统',
      text: '欢迎来到《主播模拟器：双面人生》。你将扮演主播小爱，在虚拟与现实之间寻找自我...',
      speed: 30
    });
    
    await this.wait(1000);
  }

  /**
   * 开始新的一天
   */
  private async startDay(): Promise<void> {
    if (!this.isRunning) return;
    
    logger.log('info', 'DoubleLifeGame', `开始第${this.day}天`);
    
    // 更新天数显示
    const dayEl = document.getElementById('current-day');
    if (dayEl) dayEl.textContent = this.day.toString();
    
    // 处理生存系统
    const survivalResult = this.survivalSystem.processDaily();
    if (survivalResult.crisis) {
      await this.handleCrisis(survivalResult.crisis);
    }
    
    // 检查NPC互动
    const npcInteraction = this.npcSystem.checkDailyInteraction();
    if (npcInteraction) {
      await this.handleNPCInteraction(npcInteraction);
    }
    
    // 开始直播
    await this.startLivestream();
  }

  /**
   * 开始直播
   */
  private async startLivestream(): Promise<void> {
    // 显示直播场景
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: '小爱',
      text: '开始今天的直播吧！',
      speed: 30
    });
    
    // 启动弹幕
    this.danmakuSystem.start({
      scene: '直播',
      streamerStatus: '正常',
      todayStats: {
        followers: this.state.followers,
        failCount: this.state.failCount
      },
      historyEvents: this.triggeredEvents
    });
    
    // 检查事件
    const event = this.eventManager.checkDailyEvent(this.day, this.state);
    if (event) {
      await this.handleEvent(event);
    }
    
    // 结束直播
    await this.endDay();
  }

  /**
   * 处理事件
   */
  private async handleEvent(event: GameEvent): Promise<void> {
    logger.log('info', 'DoubleLifeGame', '处理事件', { eventId: event.id });
    
    // 记录事件
    this.triggeredEvents.push(event.id);
    
    // 停止弹幕
    this.danmakuSystem.stop();
    
    // 显示事件标题
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: '事件',
      text: event.title,
      speed: 30
    });
    
    // 显示事件描述
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: '',
      text: event.description,
      speed: 30
    });
    
    // 显示选项
    const choice = await this.showChoices(event);
    
    // 应用选择效果
    if (choice) {
      this.storyChoices[event.id] = choice.id;
      await this.applyChoiceEffects(event, choice);
    }
    
    // 生成热搜（如果是重大事件）
    if (event.isMajor || Math.random() < 0.3) {
      await this.generateHotSearch(event);
    }
  }

  /**
   * 显示选项并等待选择
   */
  private async showChoices(event: GameEvent): Promise<any> {
    return new Promise((resolve) => {
      this.choicePanel?.showChoices(event.choices, (choiceId) => {
        const choice = event.choices.find(c => c.id === choiceId);
        resolve(choice);
      });
    });
  }

  /**
   * 应用选择效果
   */
  private async applyChoiceEffects(event: GameEvent, choice: any): Promise<void> {
    const effects = choice.effects;
    
    // 应用数值变化
    if (effects.followers) this.state.followers += effects.followers;
    if (effects.stamina) this.state.stamina += effects.stamina;
    if (effects.kindness) this.state.kindness += effects.kindness;
    if (effects.integrity) this.state.integrity += effects.integrity;
    if (effects.money) this.state.money += effects.money;
    if (effects.sanity) this.state.sanity += effects.sanity;
    if (effects.personaIntegrity) this.state.personaIntegrity += effects.personaIntegrity;
    
    // 应用NPC关系变化
    if (effects.npcRelations) {
      this.npcSystem.modifyRelations(effects.npcRelations);
    }
    
    // 更新翻车次数
    if (event.category?.includes('fail')) {
      this.state.failCount++;
    }
    
    // 更新UI
    this.statsPanel?.updateStats(this.state);
    
    logger.log('info', 'DoubleLifeGame', '应用选择效果', { effects });
  }

  /**
   * 生成热搜
   */
  private async generateHotSearch(event: GameEvent): Promise<void> {
    const hotSearch = this.hotSearchSystem.generate({
      event,
      playerState: this.state
    });
    
    this.hotSearchHistory.push(hotSearch);
    this.state.trendingTopics.push(hotSearch.keyword);
    
    // 显示热搜
    this.hotSearchCard?.show(hotSearch);
    
    await this.wait(2000);
  }

  /**
   * 处理危机
   */
  private async handleCrisis(crisis: any): Promise<void> {
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: '危机',
      text: crisis.message,
      speed: 30
    });
  }

  /**
   * 处理NPC互动
   */
  private async handleNPCInteraction(interaction: any): Promise<void> {
    const npc = this.npcSystem.getNPCInfo(interaction.npcId);
    const dialog = this.npcSystem.getDialog(interaction.npcId);
    
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: npc.name,
      text: dialog,
      speed: 30
    });
  }

  /**
   * 结束当天
   */
  private async endDay(): Promise<void> {
    // 停止弹幕
    this.danmakuSystem.stop();
    
    // 显示结算
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: '系统',
      text: `第${this.day}天结束。今日粉丝数：${this.state.followers}`,
      speed: 30
    });
    
    // 检查是否达到第20天
    if (this.day >= 20) {
      await this.endGame();
      return;
    }
    
    // 进入下一天
    this.day++;
    this.npcSystem.setDay(this.day);
    
    await this.wait(1000);
    await this.startDay();
  }

  /**
   * 结束游戏
   */
  private async endGame(): Promise<void> {
    this.isRunning = false;
    
    logger.log('info', 'DoubleLifeGame', '游戏结束');
    
    // 判定结局
    const ending = this.endingSystem.determineEnding(
      this.state,
      this.triggeredEvents,
      this.storyChoices
    );
    
    // 生成生涯总结
    const summary = this.careerSummarySystem.generate(
      this.state,
      this.hotSearchHistory,
      this.triggeredEvents,
      this.npcSystem.getAllRelations()
    );
    
    // 显示结局
    await this.showEnding(ending, summary);
    
    // 回调
    if (this.config.onGameEnd) {
      this.config.onGameEnd({ ending, summary });
    }
  }

  /**
   * 显示结局
   */
  private async showEnding(ending: any, summary: any): Promise<void> {
    // 显示结局标题
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: '结局',
      text: ending.name,
      speed: 30
    });
    
    // 显示结局故事
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: '',
      text: ending.story,
      speed: 30
    });
    
    // 显示生涯总结标题
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: '生涯总结',
      text: summary.title,
      speed: 30
    });
    
    // 显示开场白
    await this.dialogBox?.showText({
      containerId: 'dialog-container',
      speaker: '',
      text: summary.opening,
      speed: 30
    });
  }

  /**
   * 等待指定时间
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取当前状态
   */
  getState(): PlayerState {
    return { ...this.state };
  }

  /**
   * 获取当前天数
   */
  getDay(): number {
    return this.day;
  }

  /**
   * 是否正在运行
   */
  isGameRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 销毁游戏
   */
  destroy(): void {
    this.isRunning = false;
    
    this.danmakuSystem.stop();
    this.portrait?.destroy();
    this.dialogBox?.destroy();
    this.choicePanel?.destroy();
    this.statsPanel?.destroy();
    this.danmakuOverlay?.destroy();
    this.hotSearchCard?.destroy();
    SceneTransition.destroy();
    
    logger.log('info', 'DoubleLifeGame', '游戏已销毁');
  }
}

/**
 * 创建游戏的工厂函数
 */
export function createDoubleLifeGame(config: GameConfig): DoubleLifeGame {
  return new DoubleLifeGame(config);
}
