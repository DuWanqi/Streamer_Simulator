/**
 * 游戏主类 - 协调所有系统
 * 整合双面人生功能
 */

import { Application } from 'pixi.js';
import { GameStateManager, type GameScene } from './GameStateManager';
import { PlayerData } from './PlayerData';
import { AIService } from '../services/AIService';
import { EventPool } from '../systems/EventPool';
import * as DefaultContent from '../services/DefaultContent';
import { DIMENSIONS, SKILL_NODES, type SkillNode, type SkillDimension } from './SkillTreeConfig';
import skillTreeBgUrl from '/skill-tree-bg.png';

// 双面人生系统导入
import { NPCSystem } from '../systems/NPCSystem';
import { SurvivalSystem } from '../systems/SurvivalSystem';
import { DanmakuSystem } from '../systems/DanmakuSystem';
import { HotSearchSystem, type HotSearchItem } from '../systems/HotSearchSystem';
import { EndingSystem } from '../systems/EndingSystem';
import { CreditsSystem } from '../systems/CreditsSystem';
import { getStoryNodeByDay, hasStoryNode } from '../events/StoryNodes';
import { getRandomEvent } from '../events/RandomEvents';
import { gameLogger } from '../utils/GameLogger';

export class Game {
  public app: Application;
  public stateManager: GameStateManager;
  public playerData: PlayerData;
  public aiService: AIService;
  public eventPool: EventPool;

  // 双面人生系统
  public npcSystem: NPCSystem;
  public survivalSystem: SurvivalSystem;
  public danmakuSystem: DanmakuSystem;
  public hotSearchSystem: HotSearchSystem;
  public endingSystem: EndingSystem;
  public creditsSystem: CreditsSystem;

  // 房间背景
  private dayBgUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXvou9esw3a6BDC5gef_2UFmxwk64L0lEXcXpoiwVL3OVjCpJaQzmB4R3Rz4gHkf0AU3QdWdhz4nipuzI3iFNd2rita4FteadO_DGTizExn7lHZKq77OaBQF5fXuA0fsPyTIoSl-7JZuZ2q4w9LHwu16RSVPKpzMiV-lRrd2R8gRo283sij8VGIokZchmpt7EiALh8Bt303pQqmE5p6RdAiSFU_e-b90QDYJW2Ip5hQHjQcr21xS5ccUK4RXLvTsCkli1oT0LZ-uU';
  private nightBgUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDANr5S3ESAi059fBbWA6tdKBH36DVqok6pXWzdbij_EcRu6K2ou7CPWRr44Tzzw8t9TSMC2FAr4RqJIuD0PX0CxJaN8_RYb3p2GJ1xOadg-Tdt3tneaMLzWdMoRn9gmC88yY7r5QjAi2BFzYh9ZOjoV162ydG5OPP9J6RF-4oxPbFgIaBpo7ziQsJ3mv98fjDkxrZvMe8_Dw';

  private uiContainer: HTMLElement;
  private pixiContainer: HTMLElement;
  private currentUIElement: HTMLElement | null = null;

  constructor() {
    this.app = new Application();
    this.stateManager = new GameStateManager();
    this.playerData = new PlayerData();
    this.aiService = new AIService();
    this.eventPool = new EventPool();

    // 初始化双面人生系统
    this.npcSystem = new NPCSystem(this.playerData);
    this.survivalSystem = new SurvivalSystem(this.playerData);
    this.danmakuSystem = new DanmakuSystem(this.playerData);
    this.hotSearchSystem = new HotSearchSystem(this.playerData);
    this.endingSystem = new EndingSystem(this.playerData);
    this.creditsSystem = new CreditsSystem(this.playerData);

    // 设置日志引用
    gameLogger.setPlayerData(this.playerData);

    // 创建容器
    this.uiContainer = document.getElementById('ui-container') || document.createElement('div');
    this.pixiContainer = document.getElementById('pixi-container') || document.createElement('div');
  }

  async init(): Promise<void> {
    // 初始化PixiJS
    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x0a0a15,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.pixiContainer.appendChild(this.app.canvas);

    // 监听场景变化
    this.stateManager.onSceneChange((scene) => {
      this.renderScene(scene);
    });

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    // 渲染初始场景
    this.renderScene('start');
  }

  private renderScene(scene: GameScene): void {
    // 清除当前UI
    if (this.currentUIElement) {
      this.currentUIElement.remove();
      this.currentUIElement = null;
    }

    // 根据场景渲染对应UI
    switch (scene) {
      case 'start':
        this.renderStartScreen();
        break;
      case 'settings':
        this.renderSettingsScreen();
        break;
      case 'category_select':
        this.renderCategorySelect();
        break;
      case 'main_hub':
        this.renderMainHub();
        break;
      case 'attribute_panel':
        this.renderSkillTree();
        break;
      case 'stream_planning':
        this.renderStreamPlanning();
        break;
      case 'livestream':
        this.renderLivestream();
        break;
      case 'daily_summary':
        this.renderDailySummary();
        break;
      case 'victory':
        this.renderVictory();
        break;
      case 'game_over':
        this.renderGameOver();
        break;
    }
  }

  private renderStartScreen(): void {
    const html = `
      <div class="start-screen" style="
        width: 100vw;
        height: 100vh;
        background-image: url('./begin_background.png');
        background-size: cover;
        background-position: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
        color: white;
        position: relative;
        overflow: hidden;
        padding-bottom: 80px;
      ">
        <!-- 底部渐变遮罩 -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%); pointer-events: none;"></div>
        
        <!-- 按钮组 -->
        <div style="position: relative; z-index: 10; display: flex; flex-direction: column; gap: 16px; animation: fadeInUp 0.8s ease-out 0.2s both;">
          <button id="btn-start" style="
            padding: 18px 80px;
            font-size: 1.3rem;
            font-weight: 700;
            color: white;
            background: linear-gradient(135deg, #f49d25 0%, #ffb95e 100%);
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 30px rgba(244,157,37,0.4);
          ">开始游戏</button>
          
          <button id="btn-settings" style="
            padding: 14px 60px;
            font-size: 1rem;
            font-weight: 600;
            color: rgba(255,255,255,0.8);
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          ">设置</button>
        </div>

        <!-- 版本信息 -->
        <p style="position: absolute; bottom: 20px; color: rgba(255,255,255,0.5); font-size: 0.8rem; z-index: 10;">v1.0.0 · AI-Native Game</p>
      </div>

      <style>
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        #btn-start:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 40px rgba(244,157,37,0.6);
        }
        #btn-settings:hover {
          background: rgba(255,255,255,0.25);
          color: white;
        }
      </style>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    // 绑定事件
    element.querySelector('#btn-start')?.addEventListener('click', async () => {
      // 显示开场动画（完整立绘）- 穿越剧情
      await this.showOpeningScene();
      // 开场后进入分区选择
      this.playerData.reset();
      this.stateManager.changeScene('category_select');
    });

    element.querySelector('#btn-settings')?.addEventListener('click', () => {
      this.stateManager.changeScene('settings');
    });
  }

  private renderSettingsScreen(): void {
    const state = this.playerData.getState();
    const html = `
      <div class="settings-screen" style="
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #1a0a12 0%, #2d1422 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: white;
        padding: 40px;
        box-sizing: border-box;
      ">
        <div style="max-width: 500px; width: 100%;">
          <button id="btn-back" style="
            position: absolute;
            top: 30px;
            left: 30px;
            padding: 10px 20px;
            background: rgba(255,255,255,0.1);
            border: none;
            border-radius: 25px;
            color: white;
            cursor: pointer;
            font-size: 1rem;
          ">← 返回</button>

          <h2 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 40px; text-align: center;">设置</h2>

          <!-- 游戏介绍 -->
          <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
            <h3 style="font-size: 1.2rem; margin-bottom: 12px; color: #fe2c55;">游戏介绍</h3>
            <p style="color: #cb90ad; line-height: 1.8; font-size: 0.95rem;">
              《主播模拟器》是一款AI原生模拟经营游戏。你将扮演一名小主播，通过直播、提升属性、应对各种事件，最终成为平台顶流！
              <br><br>
              游戏共20天，每天可以提升属性、开始直播。直播中会遇到土豪打赏、PK挑战、突发事件等。AI会根据你的直播内容生成弹幕和评论。
            </p>
          </div>

          <!-- API Key配置 -->
          <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
            <h3 style="font-size: 1.2rem; margin-bottom: 12px; color: #25f4ee;">API Key 配置</h3>
            <p style="color: #8a6a7a; font-size: 0.85rem; margin-bottom: 16px;">
              配置Google AI Studio API Key以启用AI功能。不配置则使用默认预设内容。
            </p>
            <input id="api-key-input" type="password" placeholder="输入你的 API Key" value="${state.apiKey}" style="
              width: 100%;
              padding: 14px 16px;
              background: rgba(0,0,0,0.3);
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 10px;
              color: white;
              font-size: 1rem;
              margin-bottom: 12px;
              box-sizing: border-box;
            ">
            <button id="btn-save-key" style="
              width: 100%;
              padding: 12px;
              background: linear-gradient(135deg, #25f4ee 0%, #00d4aa 100%);
              border: none;
              border-radius: 10px;
              color: #000;
              font-weight: 700;
              cursor: pointer;
              font-size: 1rem;
            ">保存 API Key</button>
          </div>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    element.querySelector('#btn-back')?.addEventListener('click', () => {
      this.stateManager.goBack();
    });

    element.querySelector('#btn-save-key')?.addEventListener('click', () => {
      const input = element.querySelector('#api-key-input') as HTMLInputElement;
      this.playerData.setApiKey(input.value);
      this.aiService.setApiKey(input.value);
      alert('API Key 已保存！');
    });
  }

  private renderCategorySelect(): void {
    const html = `
      <div class="category-screen" style="
        width: 100vw;
        height: 100vh;
        background: linear-gradient(180deg, #010101 0%, #161823 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: white;
        padding: 40px;
        box-sizing: border-box;
      ">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 10px;">选择你的直播分区</h2>
          <p style="color: #8a8b91; font-size: 1rem;">这将决定你的主播人生道路</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 500px; width: 100%;">
          <button class="category-btn" data-category="music" style="
            padding: 24px;
            background: rgba(254,44,85,0.1);
            border: 2px solid rgba(254,44,85,0.3);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: left;
          ">
            <div style="width: 50px; height: 50px; background: #fe2c55; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; font-size: 1.5rem;">🎵</div>
            <h3 style="color: white; font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">音乐歌手区</h3>
            <p style="color: #8a8b91; font-size: 0.85rem;">成为顶尖偶像歌手</p>
          </button>

          <button class="category-btn" data-category="dance" style="
            padding: 24px;
            background: rgba(37,244,238,0.1);
            border: 2px solid rgba(37,244,238,0.3);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: left;
          ">
            <div style="width: 50px; height: 50px; background: #25f4ee; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; font-size: 1.5rem;">💃</div>
            <h3 style="color: white; font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">舞蹈区</h3>
            <p style="color: #8a8b91; font-size: 0.85rem;">用舞蹈征服观众</p>
          </button>

          <button class="category-btn" data-category="gaming" style="
            padding: 24px;
            background: rgba(168,85,247,0.1);
            border: 2px solid rgba(168,85,247,0.3);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: left;
          ">
            <div style="width: 50px; height: 50px; background: #a855f7; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; font-size: 1.5rem;">🎮</div>
            <h3 style="color: white; font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">游戏区</h3>
            <p style="color: #8a8b91; font-size: 0.85rem;">硬核游戏带飞全场</p>
          </button>

          <button class="category-btn" data-category="variety" style="
            padding: 24px;
            background: rgba(250,204,21,0.1);
            border: 2px solid rgba(250,204,21,0.3);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: left;
          ">
            <div style="width: 50px; height: 50px; background: #facc15; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; font-size: 1.5rem;">😂</div>
            <h3 style="color: white; font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">整活搞笑区</h3>
            <p style="color: #8a8b91; font-size: 0.85rem;">用欢笑传递快乐</p>
          </button>
        </div>
      </div>
      <style>
        .category-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
      </style>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    element.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = (btn as HTMLElement).dataset.category as 'music' | 'dance' | 'gaming' | 'variety';
        this.playerData.setCategory(category);
        // 选择分区后，先进入直播计划输入界面
        this.stateManager.changeScene('stream_planning');
      });
    });
  }

  private renderMainHub(): void {
    const state = this.playerData.getState();
    const stage = this.playerData.getStage();
    const isDaytime = !state.hasFinishedUpgrade;
    
    // 白天使用 game_main_operation_hub_2 背景，晚上使用 game_main_operation_hub_1 背景
    const dayBgUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXvou9esw3a6BDC5gef_2UFmxwk64L0lEXcXpoiwVL3OVjCpJaQzmB4R3Rz4gHkf0AU3QdWdhz4nipuzI3iFNd2rita4FteadO_DGTizExn7lHZKq77OaBQF5fXuA0fsPyTIoSl-7JZuZ2q4w9LHwu16RSVPKpzMiV-lRrd2R8gRo283sij8VGIokZchmpt7EiALh8Bt303pQqmE5p6RdAiSFU_e-b90QDYJW2Ip5hQHjQcr21xS5ccUK4RXLvTsCkli1oT0LZ-uU';
    const nightBgUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDANr5S3ESAi059fBbWA6tdKBH36DVqok6pXWzdbij_EcRu6K2ou7CPWRr44Tzzw8t9TSMC2FAr4RqJIuD0PX0CxJaN8_RYb3p2GJ1xOadg-Tdt3tneaMLzWdMoRn9gmC88yY7r5QjAi2HHkSBjSPCbtsQKBQ-KCLVGpEjbNtG-PpPo9A3PoPY0WdAIvoeFqxOsAFxccWeCYK2BFzYh9ZOjoV162ydG5OPP9J6RF-4oxPbFgIaBpo7ziQsJ3mv98fjDkxrZvMe8_Dw';
    
    const html = `
      <div class="main-hub" style="
        width: 100vw;
        height: 100vh;
        background: ${isDaytime ? '#f8f7f5' : '#221a10'};
        font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
        color: ${isDaytime ? '#1c160d' : '#f8f7f5'};
        position: relative;
        overflow: hidden;
      ">
        <!-- 背景图 -->
        <div style="
          position: absolute;
          inset: 0;
          background-image: url('${isDaytime ? dayBgUrl : nightBgUrl}');
          background-size: cover;
          background-position: center;
        "></div>
        <!-- 背景遮罩 - 降低透明度让背景更清晰 -->
        <div style="
          position: absolute;
          inset: 0;
          background: ${isDaytime ? 'rgba(255,255,255,0.15)' : 'rgba(34,26,16,0.25)'};
        "></div>
        
        <!-- 电脑屏幕点击区域 - 点击主界面中间的电脑屏幕 -->
        <div id="computer-screen" style="
          position: absolute;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          height: 200px;
          cursor: pointer;
          z-index: 100;
          border-radius: 8px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        " title="点击使用电脑">
          <div style="
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            padding: 8px 16px;
            border-radius: 20px;
            color: white;
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 1px;
            opacity: 0;
            transition: all 0.3s;
            pointer-events: none;
          ">🖥️ 进入电脑</div>
        </div>
        
        <!-- 顶部导航 -->
        <header style="
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
        ">
          <div style="width: 48px;"></div>
          <div class="glass-panel" style="
            background: ${isDaytime ? 'rgba(255,255,255,0.75)' : 'rgba(34,26,16,0.75)'};
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 12px 32px;
            border-radius: 50px;
            border: 1px solid ${isDaytime ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)'};
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 32px rgba(31,38,135,0.07);
          ">
            <span style="color: #f49d25; font-size: 1.2rem;">${isDaytime ? '☀️' : '🌙'}</span>
            <h1 style="font-size: 1.3rem; font-weight: 800; margin: 0; color: ${isDaytime ? '#221a10' : 'white'};">DAY ${state.currentDay}</h1>
          </div>
          <button id="btn-settings-hub" class="glass-panel" style="
            width: 48px;
            height: 48px;
            background: ${isDaytime ? 'rgba(255,255,255,0.75)' : 'rgba(34,26,16,0.75)'};
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid ${isDaytime ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)'};
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 32px rgba(31,38,135,0.07);
            transition: all 0.3s;
          ">⚙️</button>
        </header>

        <!-- 主内容 -->
        <main style="
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 0 40px 40px;
          height: calc(100vh - 100px);
        ">
          <!-- 左侧状态面板 -->
          <div class="glass-panel" style="
            background: ${isDaytime ? 'rgba(255,255,255,0.75)' : 'rgba(34,26,16,0.75)'};
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-radius: 20px;
            padding: 24px;
            width: 380px;
            border: 2px solid ${isDaytime ? 'rgba(255,255,255,0.6)' : 'rgba(244,157,37,0.2)'};
            box-shadow: 0 8px 32px rgba(31,38,135,0.07);
            position: relative;
            overflow: hidden;
          ">
            <!-- 装饰光晕 -->
            <div style="position: absolute; top: -16px; right: -16px; width: 96px; height: 96px; background: rgba(244,157,37,0.2); border-radius: 50%; filter: blur(32px);"></div>
            
            <!-- 头像和等级 -->
            <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 24px; position: relative;">
              <div style="position: relative;">
                <div style="
                  width: 112px;
                  height: 112px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #fe2c55, #ff6b8a);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 3.5rem;
                  border: 4px solid white;
                  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                  overflow: hidden;
                ">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPMEM-HtZU9IMMrBEO54MuBvhDuUxwm2t3opP4BV0UHj3pBTd9lZ5YEYAmk1kspY_yEgPGkFObxh70UP24dDjF-Zr63w3Zplfh2Qe845NvFxnZUW5osCvnM0RUP9LzPIvBTRYmw2Hu-zb_PBr-TnG0y4IE1cLZhqsxH-odNw_3pc7erSH7RxXc-Qcj-BlAgOAjwicSIExDv1shcK1IbyUW-vd6fmhVEzYqMAiLngIf1y6l545l7dkg1GXOL9-AyLmYNyxJZQDcvxo" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='👤';">
                </div>
                <div style="
                  position: absolute;
                  bottom: 0;
                  right: 0;
                  background: #f49d25;
                  color: white;
                  font-size: 0.75rem;
                  font-weight: 700;
                  padding: 4px 10px;
                  border-radius: 20px;
                  border: 2px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                ">LVL ${state.level}</div>
              </div>
              <h2 style="font-size: 1.5rem; font-weight: 700; margin: 12px 0 4px; color: ${isDaytime ? '#1c160d' : 'white'};">StarStreamer</h2>
              <p style="color: ${isDaytime ? '#d68315' : '#f49d25'}; font-weight: 600; font-size: 0.9rem;">${stage.name}</p>
            </div>

            <!-- 经验条 -->
            <div style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 0 4px;">
                <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${isDaytime ? 'rgba(28,22,13,0.6)' : 'rgba(255,255,255,0.6)'};">EXP Progress</span>
                <span style="font-size: 0.7rem; font-weight: 700; color: ${isDaytime ? '#d68315' : '#f49d25'};">${this.playerData.getLevelProgress()}%</span>
              </div>
              <div style="height: 12px; background: ${isDaytime ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; overflow: hidden; border: 1px solid ${isDaytime ? 'rgba(255,255,255,0.5)' : 'transparent'};">
                <div style="height: 100%; width: ${this.playerData.getLevelProgress()}%; background: #f49d25; border-radius: 12px; box-shadow: 0 0 10px rgba(244,157,37,0.5);"></div>
              </div>
            </div>

            <!-- 三项核心数值 -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              <div style="background: ${isDaytime ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)'}; border-radius: 12px; padding: 12px 8px; text-align: center; border: 1px solid ${isDaytime ? 'rgba(255,255,255,0.5)' : 'transparent'}; transition: all 0.3s;">
                <div style="font-size: 1.2rem; margin-bottom: 4px;">👥</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: ${isDaytime ? '#1c160d' : 'white'};">${PlayerData.formatNumber(state.followers)}</div>
                <div style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: ${isDaytime ? 'rgba(28,22,13,0.5)' : 'rgba(255,255,255,0.5)'};">关注</div>
              </div>
              <div style="background: ${isDaytime ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)'}; border-radius: 12px; padding: 12px 8px; text-align: center; border: 1px solid ${isDaytime ? 'rgba(255,255,255,0.5)' : 'transparent'}; transition: all 0.3s;">
                <div style="font-size: 1.2rem; margin-bottom: 4px;">⭐</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: ${isDaytime ? '#1c160d' : 'white'};">${PlayerData.formatNumber(state.fanClub)}</div>
                <div style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: ${isDaytime ? 'rgba(28,22,13,0.5)' : 'rgba(255,255,255,0.5)'};">粉丝团</div>
              </div>
              <div style="background: ${isDaytime ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)'}; border-radius: 12px; padding: 12px 8px; text-align: center; border: 1px solid ${isDaytime ? 'rgba(255,255,255,0.5)' : 'transparent'}; transition: all 0.3s;">
                <div style="font-size: 1.2rem; margin-bottom: 4px;">💰</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #22c55e;">${PlayerData.formatMoney(state.income)}</div>
                <div style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: ${isDaytime ? 'rgba(28,22,13,0.5)' : 'rgba(255,255,255,0.5)'};">收入</div>
              </div>
            </div>
          </div>

          <!-- 右侧面板 -->
          <div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-end; margin-bottom: 40px;">
            <!-- 显示今日直播计划（只读）-->
            ${state.streamContent ? `
            <div class="glass-panel" style="
              background: ${isDaytime ? 'rgba(255,255,255,0.85)' : 'rgba(34,26,16,0.85)'};
              backdrop-filter: blur(12px);
              padding: 16px 20px;
              border-radius: 16px;
              border: 1px solid ${isDaytime ? 'rgba(244,157,37,0.3)' : 'rgba(244,157,37,0.2)'};
              width: 300px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            ">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 1.1rem;">📝</span>
                <span style="font-weight: 700; color: ${isDaytime ? '#1c160d' : 'white'}; font-size: 0.9rem;">今日直播计划</span>
              </div>
              <p style="color: ${isDaytime ? '#374151' : '#d1d5db'}; font-size: 0.9rem; margin: 0; line-height: 1.5;">${state.streamContent}</p>
            </div>
            ` : ''}

            <button id="btn-upgrade" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 288px;
              height: 64px;
              background: ${isDaytime ? 'rgba(255,255,255,0.9)' : 'rgba(46,36,24,1)'};
              backdrop-filter: blur(8px);
              border: 2px solid ${isDaytime ? 'white' : 'transparent'};
              border-radius: 50px;
              padding: 8px 8px 8px 24px;
              cursor: pointer;
              transition: all 0.3s;
              box-shadow: 0 8px 24px rgba(0,0,0,0.1);
              ${state.hasFinishedUpgrade ? 'opacity: 0.5; pointer-events: none;' : ''}
            ">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background: ${isDaytime ? '#dbeafe' : 'rgba(59,130,246,0.3)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid ${isDaytime ? '#bfdbfe' : 'transparent'};">
                  <span style="font-size: 1.2rem;">📚</span>
                </div>
                <div style="text-align: left;">
                  <div style="font-weight: 700; color: ${isDaytime ? '#1c160d' : 'white'}; font-size: 1rem;">自我提升</div>
                  <div style="font-size: 0.75rem; color: ${isDaytime ? '#6b7280' : '#9ca3af'};">Training & Skills</div>
                </div>
              </div>
              <div style="width: 40px; height: 40px; background: ${isDaytime ? '#f3f4f6' : 'rgba(255,255,255,0.1)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${isDaytime ? '#374151' : 'white'};">→</div>
            </button>

            <button id="btn-stream" style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              width: 320px;
              height: 80px;
              background: linear-gradient(135deg, #f49d25 0%, #ffb95e 100%);
              border: none;
              border-radius: 50px;
              cursor: pointer;
              transition: all 0.3s;
              box-shadow: 0 8px 25px rgba(244,157,37,0.4);
              ring: 4px solid rgba(255,255,255,0.4);
              position: relative;
              overflow: hidden;
            ">
              <div style="position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transform: translateX(-100%); animation: shine 2s infinite;"></div>
              <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 50%; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.2);">
                <span style="font-size: 1.8rem;">📹</span>
              </div>
              <div style="text-align: left; color: white; position: relative; z-index: 1;">
                <div style="font-size: 1.5rem; font-weight: 800; text-transform: uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">开始直播</div>
                <div style="font-size: 0.7rem; font-weight: 500; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Go Live Now</div>
              </div>
            </button>
          </div>
        </main>
      </div>

      <style>
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        #computer-screen:hover {
          background: rgba(0, 0, 0, 0.15) !important;
          transform: translate(-50%, -50%) scale(1.05) !important;
        }
        #computer-screen:hover > div {
          opacity: 1 !important;
        }
        #btn-upgrade:hover {
          transform: scale(1.02);
          border-color: rgba(244,157,37,0.3);
        }
        #btn-stream:hover {
          transform: scale(1.03);
          box-shadow: 0 12px 35px rgba(244,157,37,0.6);
        }
        #btn-settings-hub:hover {
          transform: rotate(90deg);
        }
      </style>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    element.querySelector('#btn-settings-hub')?.addEventListener('click', () => {
      this.stateManager.changeScene('settings');
    });

    element.querySelector('#btn-upgrade')?.addEventListener('click', () => {
      if (!state.hasFinishedUpgrade) {
        this.stateManager.changeScene('attribute_panel');
      }
    });

    element.querySelector('#btn-stream')?.addEventListener('click', () => {
      // AI已在进入主界面时预热，直接进入直播
      this.stateManager.changeScene('livestream');
    });

    // 绑定电脑屏幕点击事件
    const computerScreen = element.querySelector('#computer-screen');
    console.log('[DEBUG] 电脑屏幕元素:', computerScreen);
    if (computerScreen) {
      computerScreen.addEventListener('click', (e) => {
        console.log('[DEBUG] 电脑屏幕被点击');
        e.stopPropagation();
        this.renderComputerDesktop();
      });
    } else {
      console.error('[ERROR] 找不到电脑屏幕元素');
    }

    // 检查是否需要显示每日开场和NPC对话（只在白天且未升级时）
    if (isDaytime && !state.hasFinishedUpgrade) {
      // 使用setTimeout确保UI已经渲染完成
      setTimeout(async () => {
        console.log('[DEBUG] 准备显示每日事件');
        await this.checkAndShowDailyEvents();
      }, 500);
    }
  }

  private dailyEventsShown: boolean = false;
  private pendingStoryEvents: boolean = false;

  /**
   * 统一的每日事件入口
   * 在 main_hub 渲染时触发，处理所有剧情/NPC/随机事件。
   * 事件作为直播前的互动展示，展示完毕后玩家仍可正常直播。
   */
  private async checkAndShowDailyEvents(): Promise<void> {
    if (this.dailyEventsShown) return;
    this.dailyEventsShown = true;

    const state = this.playerData.getState();
    const day = state.currentDay;

    // 1. 显示每日开场独白
    await this.showDailyOpening();

    // 2. 检查生存危机（仅显示警告，不在此扣款——扣款在 daily_summary）
    const survivalCrisis = this.survivalSystem.checkSurvivalCrisis();
    if (survivalCrisis) {
      await this.renderDialogScene({
        text: survivalCrisis.message,
        speaker: '系统提示',
        emotion: 'nervous'
      });
    }

    // 3. NPC日常互动（使用 NPCSystem，替代旧的硬编码 checkAndShowNPCDialog）
    const npcEvent = this.npcSystem.checkDailyInteraction(day);
    if (npcEvent && npcEvent.interaction) {
      gameLogger.logNPCInteraction(
        npcEvent.npcId,
        npcEvent.interaction.npcName,
        npcEvent.interaction.dialog,
        npcEvent.interaction.emotion
      );
      await this.showNPCDialog(npcEvent.interaction);
    }

    // 4. 主线剧情节点
    const storyNode = getStoryNodeByDay(day, state);
    if (storyNode) {
      gameLogger.logStoryEvent(storyNode);
      await this.showStoryNode(storyNode);
    }

    // 5. 随机事件（30%概率，仅在无主线剧情时触发）
    if (!storyNode && Math.random() < 0.3) {
      const randomEvent = getRandomEvent();
      gameLogger.logRandomEvent(randomEvent);
      await this.showRandomEvent(randomEvent);
    }

    // 标记事件已处理完毕，玩家可以正常操作
    this.pendingStoryEvents = false;
  }

  private pendingToastMessage: string | null = null;

  private renderAttributePanel(): void {
    // 清除当前UI（用于重新渲染）
    if (this.currentUIElement) {
      this.currentUIElement.remove();
      this.currentUIElement = null;
    }

    const state = this.playerData.getState();
    const stageIndex = this.playerData.getStageIndex();
    
    const attributes = [
      { type: 'appearance', name: '外貌', icon: '😊', color: '#fe2c55', level: state.appearance },
      { type: 'knowledge', name: '知识', icon: '📚', color: '#25f4ee', level: state.knowledge },
      { type: 'fame', name: '知名度', icon: '📢', color: '#ef4444', level: state.fame },
      { type: 'talent', name: '才艺', icon: '🎨', color: '#a855f7', level: state.talent },
    ];

    const html = `
      <div class="attribute-panel" style="
        width: 100vw;
        height: 100vh;
        background: linear-gradient(180deg, #121212 0%, #1e1e1e 100%);
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: white;
        padding: 40px;
        box-sizing: border-box;
        overflow-y: auto;
      ">
        <!-- 顶部 -->
        <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #fe2c55, #25f4ee); border-radius: 50%;"></div>
            <div>
              <div style="font-size: 0.75rem; color: #8a8b91;">Stream Day ${state.currentDay}</div>
              <div style="font-weight: 700;">@StreamerSim</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: rgba(0,0,0,0.4); padding: 8px 16px; border-radius: 10px; display: flex; align-items: center; gap: 8px;">
              <span style="color: #facc15;">💰</span>
              <span style="font-weight: 700;">${PlayerData.formatMoney(state.income)}</span>
            </div>
            <button id="btn-close" style="
              width: 36px;
              height: 36px;
              background: none;
              border: none;
              color: #666;
              cursor: pointer;
              font-size: 1.5rem;
            ">×</button>
          </div>
        </header>

        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">属性提升</h2>
        <p style="color: #8a8b91; font-size: 0.85rem; margin-bottom: 30px;">每个属性每日最多提升2次</p>

        <!-- 属性卡片 -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 800px;">
          ${attributes.map(attr => {
            const check = this.playerData.canUpgradeAttribute(attr.type as any);
            const dailyCount = state.dailyUpgrades[attr.type as keyof typeof state.dailyUpgrades];
            return `
              <div style="
                background: #1e1e1e;
                border-radius: 16px;
                padding: 24px;
                border: 1px solid rgba(255,255,255,0.05);
                transition: all 0.3s;
              ">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="
                    width: 80px;
                    height: 80px;
                    background: ${attr.color}20;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    margin-bottom: 16px;
                  ">${attr.icon}</div>
                  <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 4px;">${attr.name}</h3>
                  <p style="color: #8a8b91; font-size: 0.8rem; margin-bottom: 16px;">Lvl ${attr.level} · 今日已升级 ${dailyCount}/2</p>
                  <button class="upgrade-btn" data-type="${attr.type}" style="
                    width: 100%;
                    padding: 14px;
                    background: ${check.canUpgrade ? attr.color : '#333'};
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-weight: 700;
                    cursor: ${check.canUpgrade ? 'pointer' : 'not-allowed'};
                    opacity: ${check.canUpgrade ? 1 : 0.5};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                  ">
                    <span>升级</span>
                    <span style="opacity: 0.8;">¥${check.cost}</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 完成按钮 -->
        <div style="text-align: center; margin-top: 40px;">
          <button id="btn-finish" style="
            padding: 16px 60px;
            background: linear-gradient(135deg, #f49d25 0%, #ffb95e 100%);
            border: none;
            border-radius: 50px;
            color: white;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 8px 30px rgba(244,157,37,0.3);
          ">完成升级，准备直播</button>
        </div>

        <!-- 提示信息 -->
        <div id="toast" style="
          display: none;
          position: fixed;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #f49d25 0%, #ffb95e 100%);
          border: 2px solid rgba(255,255,255,0.3);
          padding: 20px 32px;
          border-radius: 16px;
          color: white;
          max-width: 500px;
          text-align: center;
          font-size: 1.1rem;
          font-weight: 600;
          box-shadow: 0 10px 40px rgba(244,157,37,0.5);
          z-index: 9999;
          animation: toastSlideIn 0.3s ease-out;
        "></div>
        <style>
          @keyframes toastSlideIn {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        </style>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    // 使用全局toast容器
    let globalToast = document.getElementById('global-toast');
    if (!globalToast) {
      globalToast = document.createElement('div');
      globalToast.id = 'global-toast';
      globalToast.style.cssText = `
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #f49d25 0%, #ffb95e 100%);
        border: 3px solid rgba(255,255,255,0.5);
        padding: 24px 40px;
        border-radius: 20px;
        color: white;
        max-width: 600px;
        text-align: center;
        font-size: 1.2rem;
        font-weight: 700;
        font-family: 'Plus Jakarta Sans', sans-serif;
        box-shadow: 0 20px 60px rgba(244,157,37,0.6), 0 0 0 4px rgba(0,0,0,0.3);
        z-index: 999999;
      `;
      document.body.appendChild(globalToast);
    }
    
    // 如果有待显示的toast消息，显示它
    if (this.pendingToastMessage) {
      console.log('[Toast] Showing message:', this.pendingToastMessage);
      globalToast.textContent = this.pendingToastMessage;
      globalToast.style.display = 'block';
      globalToast.style.animation = 'none';
      globalToast.offsetHeight; // 触发reflow
      globalToast.style.animation = 'toastSlideIn 0.3s ease-out';
      this.pendingToastMessage = null;
      setTimeout(() => { 
        console.log('[Toast] Hiding message');
        globalToast!.style.display = 'none'; 
      }, 5000);
    }

    element.querySelector('#btn-close')?.addEventListener('click', () => {
      this.stateManager.changeScene('main_hub');
    });

    element.querySelectorAll('.upgrade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = (btn as HTMLElement).dataset.type as any;
        const success = this.playerData.upgradeAttribute(type);
        if (success) {
          const { getUpgradeText } = DefaultContent;
          const text = getUpgradeText(type, stageIndex);
          // 保存toast消息，在重新渲染后显示
          this.pendingToastMessage = text;
          // 重新渲染
          this.renderAttributePanel();
        }
      });
    });

    element.querySelector('#btn-finish')?.addEventListener('click', () => {
      this.playerData.finishUpgrade();
      this.stateManager.changeScene('main_hub');
    });
  }

  private renderSkillTree(): void {
    if (this.currentUIElement) {
      this.currentUIElement.remove();
      this.currentUIElement = null;
    }

    const state = this.playerData.getState();
    const skillPoints = state.skillPoints ?? 20;
    const unlockedNodes: Set<string> = new Set(state.unlockedNodes || []);
    let selectedNodeId: string | null = null;
    let currentDimensionIndex = 0;

    const getNodeStatus = (node: SkillNode): 'locked' | 'available' | 'unlocked' => {
      if (unlockedNodes.has(node.id)) return 'unlocked';
      if (node.unlockCondition.requiredNodes.length === 0) return 'available';
      return node.unlockCondition.requiredNodes.every(id => unlockedNodes.has(id)) ? 'available' : 'locked';
    };

    const getDimProgress = (dimId: string) => {
      const dimNodes = SKILL_NODES.filter(n => n.dimensionId === dimId);
      const unlocked = dimNodes.filter(n => unlockedNodes.has(n.id)).length;
      return unlocked + '/' + dimNodes.length;
    };

    const lockSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

    const makeNodeBtn = (node: SkillNode) => {
      const status = getNodeStatus(node);
      const isSelected = selectedNodeId === node.id;
      const dim = DIMENSIONS.find(d => d.id === node.dimensionId);
      const gf = node.gradientFrom || dim?.gradientFrom || '#f472b6';
      const gt = node.gradientTo || dim?.gradientTo || '#ec4899';

      let btnStyle, badgeBg, labelBg, labelColor, labelBorder, iconOpacity, overlayHtml;

      if (status === 'unlocked') {
        btnStyle = `width:80px;height:80px;border-radius:50%;border:5px solid #fff;transition:all .3s;background:linear-gradient(135deg,${gf},${gt});box-shadow:0 8px 25px ${gf}50;color:#fff;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;flex-shrink:0;`;
        badgeBg = '#fbbf24';
        labelBg = 'rgba(255,255,255,0.95)';
        labelColor = '#db2777';
        labelBorder = '#fce7f3';
        iconOpacity = '1';
        overlayHtml = '';
      } else if (status === 'available') {
        btnStyle = `width:80px;height:80px;border-radius:50%;border:5px solid #fff;transition:all .3s;background:linear-gradient(135deg,${gf},${gt});box-shadow:0 8px 25px ${gf}50;color:#fff;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;flex-shrink:0;`;
        badgeBg = '#ec4899';
        labelBg = 'rgba(255,255,255,0.95)';
        labelColor = '#db2777';
        labelBorder = '#fce7f3';
        iconOpacity = '1';
        overlayHtml = '';
      } else {
        btnStyle = 'width:80px;height:80px;border-radius:50%;border:5px solid #e5e7eb;transition:all .3s;background:#f3f4f6;color:#9ca3af;display:flex;align-items:center;justify-content:center;position:relative;cursor:not-allowed;flex-shrink:0;';
        badgeBg = '#9ca3af';
        labelBg = 'rgba(255,255,255,0.8)';
        labelColor = '#9ca3af';
        labelBorder = '#f3f4f6';
        iconOpacity = '0.5';
        overlayHtml = `<div style="position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(1px);">${lockSvg}</div>`;
      }

      if (isSelected && status !== 'locked') {
        btnStyle += `box-shadow:0 0 0 6px ${gf}60,0 8px 30px ${gf}60;transform:scale(1.1);`;
        badgeBg = '#ec4899';
        labelBg = '#ec4899';
        labelColor = '#fff';
        labelBorder = '#f472b6';
      }

      const dimNodes = SKILL_NODES.filter(n => n.dimensionId === node.dimensionId);
      const progress = dimNodes.filter(n => unlockedNodes.has(n.id)).length + '/' + dimNodes.length;

      return `<div style="position:absolute;left:${node.position.x}%;top:${node.position.y}%;transform:translate(-50%,-50%);z-index:10;" data-node-id="${node.id}">
        <button class="st-node-btn" data-id="${node.id}" style="${btnStyle}">
          <div style="opacity:${iconOpacity};filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${node.svgIcon}</div>
          ${overlayHtml}
          <div style="position:absolute;bottom:-8px;right:-8px;min-width:32px;height:28px;padding:0 8px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:20;background:${badgeBg};color:#fff;">${progress}</div>
        </button>
        <div style="position:absolute;top:100%;margin-top:14px;left:50%;transform:translateX(-50%);text-align:center;width:max-content;pointer-events:none;">
          <span style="font-size:13px;font-weight:900;padding:6px 14px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.08);border:2px solid ${labelBorder};background:${labelBg};color:${labelColor};transition:all .3s;display:inline-block;white-space:nowrap;">${node.name}</span>
        </div>
      </div>`;
    };

    // 生成分页导航
    const makeTabNavigation = () => {
      return DIMENSIONS.map((dim, index) => {
        const isActive = index === currentDimensionIndex;
        const progress = getDimProgress(dim.id);
        return `<button class="st-tab-btn ${isActive ? 'active' : ''}" data-index="${index}" style="
          padding: 12px 24px;
          border-radius: 16px;
          border: none;
          font-weight: 900;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          background: ${isActive ? `linear-gradient(135deg,${dim.gradientFrom},${dim.gradientTo})` : 'rgba(255,255,255,0.7)'};
          color: ${isActive ? '#fff' : dim.color};
          box-shadow: ${isActive ? `0 4px 15px ${dim.gradientFrom}50` : '0 2px 8px rgba(0,0,0,0.08)'};
          display: flex;
          align-items: center;
          gap: 6px;
          border: 2px solid ${isActive ? '#fff' : 'transparent'};
        ">
          <span style="font-size:18px;">${dim.icon}</span>
          <span>${dim.name}</span>
          <span style="font-size:11px;opacity:0.9;background:rgba(255,255,255,0.3);padding:2px 6px;border-radius:99px;">${progress}</span>
        </button>`;
      }).join('');
    };

    // 生成当前维度的节点
    const makeDimensionNodes = () => {
      const currentDim = DIMENSIONS[currentDimensionIndex];
      const dimNodes = SKILL_NODES.filter(n => n.dimensionId === currentDim.id);
      return dimNodes.map(node => makeNodeBtn(node)).join('');
    };

    // 生成节点之间的连线
    const makeConnections = () => {
      const currentDim = DIMENSIONS[currentDimensionIndex];
      const dimNodes = SKILL_NODES.filter(n => n.dimensionId === currentDim.id);
      let lines = '';
      
      dimNodes.forEach(node => {
        if (node.connections) {
          node.connections.forEach(targetId => {
            const target = SKILL_NODES.find(n => n.id === targetId);
            if (target && target.dimensionId === currentDim.id) {
              const x1 = node.position.x;
              const y1 = node.position.y;
              const x2 = target.position.x;
              const y2 = target.position.y;
              
              // 计算连线样式
              const isUnlocked = unlockedNodes.has(node.id) && unlockedNodes.has(targetId);
              const lineColor = isUnlocked ? node.gradientFrom : '#e5e7eb';
              
              lines += `<line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" 
                stroke="${lineColor}" 
                stroke-width="3" 
                stroke-dasharray="${isUnlocked ? '0' : '5,5'}"
                style="opacity: ${isUnlocked ? 1 : 0.5};" />`;
            }
          });
        }
      });
      
      return lines;
    };

    const settingsSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>';
    const sparklesSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 3px 6px rgba(168,85,247,0.4));"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>';
    const sparklesSmSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>';

    const html = `
      <div id="skill-tree-page" style="width:100vw;height:100vh;overflow:hidden;position:relative;background:linear-gradient(135deg,#fce7f3 0%,#fdf2f8 25%,#faf5ff 50%,#eff6ff 75%,#f0f9ff 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;">
        <style>
          .st-node-btn:hover{transform:scale(1.12)!important;}
          .st-node-btn:active{transform:scale(1.05)!important;}
          @keyframes spin-slow{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
          .st-spin{animation:spin-slow 4s linear infinite;display:inline-block;}
          @keyframes ping-anim{0%{transform:scale(1);opacity:.6;}50%,100%{transform:scale(1.8);opacity:0;}}
          .st-ping-wrap{position:relative;display:inline-flex;align-items:center;}
          .st-ping-wrap::before{content:'';position:absolute;inset:-4px;border-radius:inherit;background:currentColor;opacity:0;animation:ping-anim 2s cubic-bezier(0,0,.2,1) infinite;}
          .st-unlock-btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(236,72,153,0.35);}
          .st-unlock-btn:active{transform:translateY(0);}
          .st-dim-tag{font-size:11px;padding:3px 10px;border-radius:99px;font-weight:800;display:inline-block;}
          .st-tab-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.15);}
          .st-tab-btn.active:hover{transform:translateY(-2px);}
        </style>

        <div style="display:flex;height:100%;">
          <div style="flex:1;position:relative;min-width:0;overflow:hidden;">
            <!-- 顶部标题和技能点 -->
            <div style="position:absolute;top:16px;left:20px;z-index:30;display:flex;align-items:center;gap:16px;">
              <div style="font-size:22px;font-weight:900;color:#be185d;display:flex;align-items:center;gap:6px;">
                <span style="font-size:26px;">💖</span> 主播模拟器
              </div>
            </div>

            <div style="position:absolute;top:16px;left:50%;transform:translateX(-50%);z-index:30;background:linear-gradient(135deg,#fce7f3,#fbcfe8);border:2.5px solid #f9a8d4;border-radius:99px;padding:8px 24px;display:flex;align-items:center;gap:8px;box-shadow:0 4px 15px rgba(236,72,153,0.2);">
              <span style="color:#ec4899;font-size:18px;">💗</span>
              <span style="font-size:17px;font-weight:900;color:#be185d;">技能点</span>
              <span style="font-size:22px;font-weight:900;color:#db2777;" id="st-sp-display">${skillPoints}</span>
              <span style="color:#f472b6;font-size:16px;">✨</span>
            </div>

            <button id="st-close-btn" title="返回主界面" style="position:absolute;top:16px;right:20px;z-index:30;width:42px;height:42px;border-radius:50%;border:none;background:rgba(255,255,255,0.7);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;color:#be185d;transition:all .2s;box-shadow:0 2px 10px rgba(0,0,0,0.08);">
              ✕
            </button>

            <!-- 分页导航 -->
            <div id="st-tab-nav" style="position:absolute;top:70px;left:50%;transform:translateX(-50%);z-index:30;display:flex;gap:12px;">
              ${makeTabNavigation()}
            </div>

            <!-- 技能树区域 -->
            <div style="position:absolute;inset:130px 0 80px 0;" id="st-nodes-area">
              <!-- SVG连线层 -->
              <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;" id="st-connections">
                ${makeConnections()}
              </svg>
              <!-- 节点层 -->
              <div style="position:absolute;inset:0;z-index:10;" id="st-nodes-container">
                ${makeDimensionNodes()}
              </div>
            </div>

            <!-- 维度标题 -->
            <div style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);z-index:30;text-align:center;">
              <div style="font-size:24px;font-weight:900;color:${DIMENSIONS[currentDimensionIndex].color};display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.9);padding:12px 24px;border-radius:16px;box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <span style="font-size:28px;">${DIMENSIONS[currentDimensionIndex].icon}</span>
                <span>${DIMENSIONS[currentDimensionIndex].name}</span>
                <span style="font-size:14px;color:#666;font-weight:600;">· ${DIMENSIONS[currentDimensionIndex].subtitle}</span>
              </div>
            </div>
          </div>

          <div id="st-sidebar" style="width:300px;min-width:300px;background:rgba(255,255,255,0.92);backdrop-filter:blur(20px);border-left:4px solid #fff;box-shadow:-10px 0 30px rgba(236,72,153,0.1);padding:24px;display:flex;flex-direction:column;position:relative;z-index:20;overflow-y:auto;">
            <h2 style="font-size:19px;font-weight:900;color:#1f2937;margin-bottom:20px;display:flex;align-items:center;gap:8px;">
              <span class="st-spin">${settingsSvg}</span> 技能研究所
            </h2>

            <div id="st-sidebar-content" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px 0;">
              <div style="width:112px;height:112px;margin:0 auto 20px;border-radius:32px;background:linear-gradient(135deg,#c084fc,#a855f7);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(168,85,247,0.35);transform:rotate(-3deg);border:4px solid #fff;">
                ${sparklesSvg}
              </div>
              <p style="font-size:15px;font-weight:700;color:#6b7280;line-height:1.6;margin-bottom:12px;">点击左侧的技能节点<br/>查看详情并解锁新能力</p>
              <p style="font-size:13px;color:#9ca3af;">选择一个技能开始研究吧~</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    // 更新节点显示
    const updateNodesDisplay = () => {
      const nodesContainer = element.querySelector('#st-nodes-container') as HTMLElement;
      const connectionsSvg = element.querySelector('#st-connections') as HTMLElement;
      const tabNav = element.querySelector('#st-tab-nav') as HTMLElement;
      const dimTitle = element.querySelector('[style*="bottom:20px"]') as HTMLElement;
      
      if (nodesContainer) nodesContainer.innerHTML = makeDimensionNodes();
      if (connectionsSvg) connectionsSvg.innerHTML = makeConnections();
      if (tabNav) tabNav.innerHTML = makeTabNavigation();
      if (dimTitle) {
        const currentDim = DIMENSIONS[currentDimensionIndex];
        dimTitle.innerHTML = `
          <div style="font-size:24px;font-weight:900;color:${currentDim.color};display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.9);padding:12px 24px;border-radius:16px;box-shadow:0 4px 15px rgba(0,0,0,0.1);">
            <span style="font-size:28px;">${currentDim.icon}</span>
            <span>${currentDim.name}</span>
            <span style="font-size:14px;color:#666;font-weight:600;">· ${currentDim.subtitle}</span>
          </div>
        `;
      }
      
      // 重新绑定节点点击事件
      bindNodeEvents();
      // 重新绑定标签页点击事件
      bindTabEvents();
    };

    // 绑定节点点击事件
    const bindNodeEvents = () => {
      element.querySelectorAll('.st-node-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const nid = (btn as HTMLElement).dataset.id;
          const node = SKILL_NODES.find(n => n.id === nid);
          if (!node) return;
          selectedNodeId = nid ?? null;
          element.querySelectorAll('.st-node-btn').forEach(b => { (b as HTMLElement).style.transform = ''; });
          (btn as HTMLElement).style.transform = 'scale(1.1)';
          updateSidebar(node);
        });
      });
    };

    // 绑定标签页点击事件
    const bindTabEvents = () => {
      element.querySelectorAll('.st-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt((btn as HTMLElement).dataset.index || '0');
          currentDimensionIndex = index;
          selectedNodeId = null;
          updateNodesDisplay();
        });
      });
    };

    const updateSidebar = (node: SkillNode) => {
      const status = getNodeStatus(node);
      const dim = DIMENSIONS.find(d => d.id === node.dimensionId);
      const sidebarContent = element.querySelector('#st-sidebar-content') as HTMLElement;
      const cost = node.unlockCondition.cost ?? 1;
      const canAfford = skillPoints >= cost && status === 'available';
      const dimNodes = SKILL_NODES.filter(n => n.dimensionId === node.dimensionId);
      const unlockedInDim = dimNodes.filter(n => unlockedNodes.has(n.id)).length;

      let statusText, statusStyle;
      if (status === 'unlocked') { statusText = '已学习'; statusStyle = 'background:#dcfce7;color:#166534;'; }
      else if (status === 'available') { statusText = '可学习'; statusStyle = 'background:#fef3c7;color:#92400e;'; }
      else { statusText = '未解锁'; statusStyle = 'background:#fee2e2;color:#991b1b;'; }

      const prereqHtml = node.unlockCondition.requiredNodes.length > 0
        ? `<div style="margin-top:14px;padding:12px 14px;background:#f9fafb;border-radius:12px;text-align:left;">
             <div style="font-size:12px;font-weight:800;color:#4b5563;margin-bottom:8px;">📋 前置要求：</div>
             ${node.unlockCondition.requiredNodes.map(id => {
               const rn = SKILL_NODES.find(n => n.id === id);
               const u = unlockedNodes.has(id);
               return `<span style="display:inline-block;font-size:11px;padding:3px 10px;border-radius:99px;margin:3px 4px 3px 0;font-weight:700;color:${u ? '#166534' : '#9ca3af'};background:${u ? '#dcfce7' : '#f3f4f6'};${u ? '' : 'text-decoration:line-through;'}">${rn?.icon || '?'} ${rn?.name || id}${u ? ' ✓' : ''}</span>`;
             }).join('')}
           </div>`
        : '';

      sidebarContent.style.alignItems = 'stretch';
      sidebarContent.style.justifyContent = 'flex-start';
      sidebarContent.innerHTML = `
        <div style="width:112px;height:112px;margin:0 auto 18px;border-radius:32px;background:linear-gradient(135deg,${node.gradientFrom || dim?.gradientFrom || '#c084fc'},${node.gradientTo || dim?.gradientTo || '#a855f7'});display:flex;align-items:center;justify-content:center;box-shadow:0 8px 30px ${(node.gradientFrom || '#a855f7')}50;transform:rotate(-3deg);border:4px solid #fff;flex-shrink:0;">
          <div style="color:#fff;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${node.svgIcon.replace(/width="28"/g, 'width="48"').replace(/height="28"/g, 'height="48"')}</div>
        </div>
        <h3 style="font-size:20px;font-weight:900;color:#111827;margin-bottom:6px;text-align:center;">${node.name}</h3>
        <div style="text-align:center;margin-bottom:12px;">
          <span class="st-dim-tag" style="background:${dim?.gradientFrom || '#ddd'}18;color:${dim?.color || '#666'};border:1.5px solid ${dim?.gradientFrom || '#ccc'}40;">${dim?.icon || ''} ${dim?.name || ''} · 第${node.tier}阶</span>
        </div>
        <p style="font-size:13px;color:#4b5563;line-height:1.65;margin-bottom:14px;text-align:left;background:#f9fafb;padding:14px;border-radius:12px;">${node.description}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
          <div style="flex:1;min-width:80px;padding:10px 12px;border-radius:12px;text-align:center;background:#f0fdf4;border:1.5px solid #bbf7d0;">
            <div style="font-size:11px;color:#166534;font-weight:600;">等级</div>
            <div style="font-size:18px;font-weight:900;color:#15803d;">Lv.${node.tier}</div>
          </div>
          <div style="flex:1;min-width:80px;padding:10px 12px;border-radius:12px;text-align:center;background:#fefce8;border:1.5px solid #fde68a;">
            <div style="font-size:11px;color:#92400e;font-weight:600;">消耗SP</div>
            <div style="font-size:18px;font-weight:900;color:#b45309;">${cost}</div>
          </div>
          <div style="flex:1;min-width:80px;padding:10px 12px;border-radius:12px;text-align:center;background:#fef2f2;border:1.5px solid #fecaca;">
            <div style="font-size:11px;color:#991b1b;font-weight:600;">状态</div>
            <div style="font-size:12px;font-weight:900;padding:3px 8px;border-radius:99px;display:inline-block;margin-top:2px;${statusStyle}">${statusText}</div>
          </div>
        </div>
        <div style="padding:10px 14px;border-radius:12px;background:#f8fafc;border:1.5px solid #e2e8f0;margin-bottom:14px;">
          <div style="font-size:12px;font-weight:700;color:#475569;display:flex;justify-content:space-between;">
            <span>📊 维度进度</span><span style="color:${dim?.color || '#666'};font-weight:900;">${unlockedInDim}/${dimNodes.length}</span>
          </div>
          <div style="margin-top:6px;height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;">
            <div style="height:100%;border-radius:3px;background:linear-gradient(90deg,${dim?.gradientFrom || '#888'},${dim?.gradientTo || '#666'});width:${Math.round((unlockedInDim / dimNodes.length) * 100)}%;transition:width .5s ease;"></div>
          </div>
        </div>
        ${prereqHtml}
        <button id="st-action-btn" style="${status === 'available' && canAfford
          ? 'width:100%;padding:14px 24px;border-radius:14px;border:none;font-weight:900;font-size:15px;cursor:pointer;background:linear-gradient(135deg,#ec4899,#f43f5e);color:#fff;box-shadow:0 6px 20px rgba(236,72,153,0.35);transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;border-bottom:4px solid #be185d;'
          : 'width:100%;padding:14px 24px;border-radius:14px;border:none;font-weight:900;font-size:15px;cursor:not-allowed;background:#f3f4f6;color:#9ca3af;'}">
          ${status === 'unlocked' ? '✅ 已学习'
            : status === 'locked' ? '🔒 未满足前置条件'
            : !canAfford ? '❌ 技能点不足'
            : `<span class="st-ping-wrap">消耗 ${cost} SP 学习技能 ${sparklesSmSvg}</span>`}
        </button>
      `;

      if (status === 'available' && canAfford) {
        const actionBtn = sidebarContent.querySelector('#st-action-btn') as HTMLElement;
        actionBtn.classList.add('st-unlock-btn');
        actionBtn.addEventListener('click', () => {
          if (this.playerData.spendSkillPoints(cost)) {
            this.playerData.unlockNode(node.id);
            showUnlockCelebration(node);
            selectedNodeId = null;
            setTimeout(() => this.renderSkillTree(), 100);
          }
        });
      }
    };

    const showUnlockCelebration = (node: SkillNode) => {
      const cele = document.createElement('div');
      cele.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:99999;pointer-events:none;background:rgba(0,0,0,0.15);backdrop-filter:blur(4px);animation:celeFadeOut 1.5s ease forwards;';
      cele.innerHTML = `<style>@keyframes celePop{from{opacity:0;transform:scale(0.5) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}@keyframes celeFadeOut{0%{opacity:1;}75%{opacity:1;}100%{opacity:0;}}</style>
        <div style="text-align:center;animation:celePop .5s cubic-bezier(.34,1.56,.64,1);">
          <div style="font-size:56px;">🎉</div>
          <div style="font-size:22px;font-weight:900;color:#e84a7f;margin-top:12px;">解锁成功！</div>
          <div style="font-size:16px;color:#666;margin-top:8px;background:rgba(255,255,255,0.95);padding:12px 24px;border-radius:14px;display:inline-block;margin-top:12px;">${node.svgIcon.replace(/width="28"/g, 'width="24"').replace(/height="28"/g, 'height="24"')} ${node.name}</div>
        </div>`;
      document.body.appendChild(cele);
      setTimeout(() => cele.remove(), 1500);
    };

    // 初始化绑定事件
    bindNodeEvents();
    bindTabEvents();

    element.querySelector('#st-close-btn')?.addEventListener('click', () => { this.stateManager.changeScene('main_hub'); });
  }

  private renderStreamPlanning(): void {
    const state = this.playerData.getState();
    const stage = this.playerData.getStage();
    
    // 根据分区选择标签
    const categoryTags: Record<string, string[]> = {
      music: ['#音乐', '#唱歌'],
      dance: ['#舞蹈', '#才艺'],
      gaming: ['#游戏', '#直播'],
      variety: ['#整活', '#搞笑'],
    };
    const tags = state.category ? categoryTags[state.category] : ['#直播', '#娱乐'];
    
    const html = `
      <div class="stream-planning" style="
        width: 100vw;
        height: 100vh;
        background: #000;
        font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
        color: white;
        position: relative;
        overflow: hidden;
      ">
        <!-- 背景图 -->
        <div style="
          position: absolute;
          inset: 0;
          background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbcVCJDK8xGzwi-eUP1-2dtLOB9c-ohNqHo6vwa2z2chGy_f-MKc12rkuiC7Sd4RaxbOtxRVumsUa3vrDgBtp5ZYGideWzh43oIGpHKGYmyUNL2MOQ4lfLww8xoxtxf9kJp8N4ozl44lSglNyY8SA8QzfosC0wthe5Ghkp7Wc2xBykutQnn10TZNiY4qxGqlJzJQuUYdqUB2UhqLytLBchKCSdNZATnC0ifJuaAnav7r_w5XSyGgb8VMxHb5HHSFd0MifkDSju9m_d');
          background-size: cover;
          background-position: center;
        "></div>
        <!-- 渐变遮罩 -->
        <div style="
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(0,0,0,0.8) 100%);
        "></div>
        
        <!-- 顶部栏 -->
        <div style="
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(12px);
            padding: 8px 16px;
            border-radius: 50px;
            border: 1px solid rgba(255,255,255,0.1);
          ">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: pulse 2s infinite;"></div>
            <span style="font-size: 0.75rem; font-weight: 700; letter-spacing: 1px;">LIVE PREVIEW</span>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="text-align: right;">
              <div style="font-size: 0.7rem; color: #9ca3af; font-weight: 600;">Followers</div>
              <div style="font-size: 0.9rem; font-weight: 800;">${PlayerData.formatNumber(state.followers)}</div>
            </div>
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: linear-gradient(135deg, #fe2c55 0%, #25f4ee 100%);
              opacity: 0.8;
              border: 2px solid rgba(255,255,255,0.2);
            "></div>
          </div>
        </div>
        
        <!-- 右侧工具栏 -->
        <div style="
          position: absolute;
          right: 20px;
          top: 100px;
          z-index: 20;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        ">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; opacity: 0.9;">
            <span style="font-size: 1.5rem;">🔄</span>
            <span style="font-size: 0.65rem; font-weight: 600;">Flip</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; opacity: 0.9;">
            <span style="font-size: 1.5rem;">✨</span>
            <span style="font-size: 0.65rem; font-weight: 600;">Enhance</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; opacity: 0.9;">
            <span style="font-size: 1.5rem;">😎</span>
            <span style="font-size: 0.65rem; font-weight: 600;">Effects</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; opacity: 0.9;">
            <span style="font-size: 1.5rem;">🎨</span>
            <span style="font-size: 0.65rem; font-weight: 600;">Filters</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; opacity: 0.9;">
            <span style="font-size: 1.5rem;">🎵</span>
            <span style="font-size: 0.65rem; font-weight: 600;">Music</span>
          </div>
        </div>
        
        <!-- 中间输入区域 -->
        <div style="
          position: absolute;
          left: 24px;
          top: 35%;
          z-index: 20;
          max-width: 70%;
        ">
          <div style="
            background: rgba(37,244,238,0.2);
            backdrop-filter: blur(8px);
            padding: 6px 14px;
            border-radius: 8px;
            border: 1px solid rgba(37,244,238,0.3);
            display: inline-block;
            margin-bottom: 12px;
            transform: rotate(-1deg);
          ">
            <span style="font-size: 0.75rem; font-weight: 700; color: #25f4ee; text-transform: uppercase; letter-spacing: 1px;">📡 DAY ${state.currentDay} 直播主题</span>
          </div>
          
          <div style="
            position: relative;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(12px);
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 4px;
          ">
            <textarea id="stream-content" placeholder="输入今天的直播内容...&#10;例如：今天玩恐怖游戏，胆小慎入！&#10;或者：今天唱歌点歌专场~" style="
              width: 100%;
              min-width: 320px;
              height: 120px;
              background: transparent;
              border: none;
              color: white;
              font-size: 1.3rem;
              font-weight: 700;
              font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
              padding: 16px;
              resize: none;
              outline: none;
              line-height: 1.5;
            ">${state.streamContent}</textarea>
            <div style="
              position: absolute;
              bottom: 12px;
              left: 16px;
              display: flex;
              gap: 8px;
            ">
              <span style="font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px;">${tags[0]}</span>
              <span style="font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 4px;">${tags[1]}</span>
            </div>
          </div>
          
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
          ">
            <span style="font-size: 1rem;">💡</span>
            <p style="font-size: 0.8rem; color: rgba(255,255,255,0.8); font-weight: 500;">AI会根据你的内容生成弹幕和评论！</p>
          </div>
        </div>
        
        <!-- 底部操作栏 -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 30;
          padding: 24px;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 70%, transparent 100%);
        ">
          <!-- 标签栏 -->
          <div style="
            display: flex;
            justify-content: center;
            gap: 32px;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          ">
            <span style="font-size: 0.85rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; cursor: pointer;">Camera</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; cursor: pointer;">Templates</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid white; padding-bottom: 16px; margin-bottom: -17px;">Live</span>
          </div>
          
          <!-- GO LIVE 按钮 -->
          <button id="btn-confirm-plan" style="
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 18px 40px;
            background: linear-gradient(135deg, #fe2c55 0%, #ff4d6d 100%);
            border: none;
            border-radius: 50px;
            color: white;
            font-size: 1.2rem;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 0 30px rgba(254,44,85,0.5);
            transition: all 0.3s;
          ">
            <span style="font-size: 1.4rem;">📹</span>
            确认计划，进入今日
          </button>
          
          <!-- 底部链接 -->
          <div style="
            display: flex;
            justify-content: space-between;
            margin-top: 16px;
            padding: 0 20px;
          ">
            <span style="font-size: 0.8rem; color: #6b7280; cursor: pointer; display: flex; align-items: center; gap: 4px;">⚙️ Settings</span>
            <span style="font-size: 0.8rem; color: #6b7280; cursor: pointer; display: flex; align-items: center; gap: 4px;">📤 Share Preview</span>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        #btn-confirm-plan:hover {
          transform: scale(1.02);
          box-shadow: 0 0 40px rgba(254,44,85,0.7);
        }
        #stream-content::placeholder {
          color: rgba(255,255,255,0.5);
        }
      </style>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    element.querySelector('#btn-confirm-plan')?.addEventListener('click', async () => {
      const textarea = element.querySelector('#stream-content') as HTMLTextAreaElement;
      const content = textarea.value.trim() || '今天随便播播~';
      this.playerData.setStreamContent(content);
      
      // 异步预热AI（在玩家升级属性期间完成AI响应）
      if (state.category) {
        this.aiService.preheat(content, state.category, this.playerData.getState());
      }
      
      // 进入主界面
      this.stateManager.changeScene('main_hub');
    });
  }

  private renderLivestream(): void {
    const state = this.playerData.getState();
    const events = this.eventPool.generateDayEvents(state);
    
    // 简化版直播界面
    const html = `
      <div class="livestream" style="
        width: 100vw;
        height: 100vh;
        background: linear-gradient(180deg, #221019 0%, #180a12 100%);
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: white;
        position: relative;
        overflow: hidden;
      ">
        <!-- 背景 -->
        <div style="
          position: absolute;
          inset: 0;
          background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCEHSEg-cE7rHJ5bZc4Sa20jAgvdoB3bSGLl8OKEc6_QdPlbEa517hutDZi-OqiRPvLGFjNh9YtwRiBhPfUsaJMYScGCy_JinSHTe-j-ZXrrp-VKUzgIHcl7Gc7qgc9R0cFCopanjlw6kAlMhSQcoy9LZCXfEPhWND2XvKHA0fBtmy5APRaj6hK3AtAWOG879rZgmAzbeVql1UMhb9lWS1kPLkRrhN6tIy3dzBSXAuQjv3sfp_mbyHjkA16YkYyBx-3vjZksfFo0f4');
          background-size: cover;
          background-position: center;
          opacity: 0.5;
        "></div>
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 30%, rgba(0,0,0,0.8) 100%);"></div>

        <!-- 顶部信息 -->
        <header style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          z-index: 20;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(10px);
            padding: 8px 16px 8px 8px;
            border-radius: 50px;
            border: 1px solid rgba(255,255,255,0.1);
          ">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #fe2c55, #25f4ee); border-radius: 50%;"></div>
            <div>
              <div style="font-size: 0.8rem; font-weight: 700;">PixelQueen</div>
              <div style="font-size: 0.7rem; color: #cb90ad;">${PlayerData.formatNumber(state.followers)} Followers</div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              background: rgba(0,0,0,0.4);
              backdrop-filter: blur(10px);
              padding: 8px 16px;
              border-radius: 50px;
              border: 1px solid rgba(255,255,255,0.1);
            ">
              <div style="width: 8px; height: 8px; background: #ff0000; border-radius: 50%; animation: pulse 1s infinite;"></div>
              <span style="font-size: 0.85rem; font-weight: 700;">${PlayerData.formatNumber(PlayerData.getViewerCount(state.followers, state.stageId))} 人在看</span>
            </div>
          </div>
        </header>

        <!-- 弹幕区域 -->
        <div id="danmaku-container" style="
          position: absolute;
          top: 100px;
          left: 0;
          right: 0;
          height: 200px;
          overflow: hidden;
          z-index: 15;
        "></div>

        <!-- 评论区域 -->
        <div style="
          position: absolute;
          bottom: 100px;
          left: 20px;
          width: 300px;
          max-height: 250px;
          overflow: hidden;
          z-index: 20;
        ">
          <div id="comments-container" style="display: flex; flex-direction: column; gap: 8px;"></div>
        </div>

        <!-- 底部操作 -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%);
          z-index: 20;
        ">
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
            <div style="
              flex: 1;
              max-width: 300px;
              height: 44px;
              background: rgba(0,0,0,0.4);
              backdrop-filter: blur(10px);
              border-radius: 50px;
              padding: 0 20px;
              display: flex;
              align-items: center;
              color: rgba(255,255,255,0.5);
              border: 1px solid rgba(255,255,255,0.1);
            ">Say something...</div>
            <button style="width: 44px; height: 44px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; color: white; cursor: pointer;">❤️</button>
            <button style="width: 44px; height: 44px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; color: white; cursor: pointer;">🎁</button>
            <button id="btn-end-stream" style="
              padding: 12px 30px;
              background: #fe2c55;
              border: none;
              border-radius: 50px;
              color: white;
              font-weight: 700;
              cursor: pointer;
            ">结束直播</button>
          </div>
        </div>

        <!-- 事件弹窗容器 -->
        <div id="event-popup" style="display: none;"></div>
      </div>

      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes danmaku-scroll {
          from { transform: translateX(100%); right: 0; }
          to { transform: translateX(-100vw); right: 0; }
        }
      </style>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    const danmakuContainer = element.querySelector('#danmaku-container') as HTMLElement;
    const commentsContainer = element.querySelector('#comments-container') as HTMLElement;
    const eventPopup = element.querySelector('#event-popup') as HTMLElement;

    // 弹幕系统
    const { getDanmaku, getRandomComment, getBigSpenderName, getRandomGift, getSuddenEvent } = DefaultContent;
    
    let danmakuInterval: number;
    let commentInterval: number;
    let eventIndex = 0;

    // 添加弹幕 - 从右边飘到左边
    const addDanmaku = () => {
      const text = getDanmaku(state.category);
      const danmaku = document.createElement('div');
      danmaku.textContent = text;
      const duration = 6 + Math.random() * 4;
      danmaku.style.cssText = `
        position: absolute;
        white-space: nowrap;
        color: white;
        font-weight: 600;
        font-size: ${12 + Math.random() * 8}px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        top: ${Math.random() * 150}px;
        right: 0;
        transform: translateX(100%);
        animation: danmaku-scroll ${duration}s linear forwards;
      `;
      danmakuContainer.appendChild(danmaku);
      setTimeout(() => danmaku.remove(), (duration + 2) * 1000);
    };

    // 添加评论
    const addComment = () => {
      const comment = getRandomComment();
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.05);
        ">
          <span style="color: #cb90ad; font-size: 0.75rem; font-weight: 600;">${comment.user}</span>
          <span style="color: white; font-size: 0.85rem; margin-left: 8px;">${comment.text}</span>
        </div>
      `;
      commentsContainer.appendChild(el);
      if (commentsContainer.children.length > 6) {
        commentsContainer.firstChild?.remove();
      }
    };

    // 显示事件弹窗
    const showEvent = (event: any) => {
      const impact = this.eventPool.calculateEventImpact(event, state);
      
      let eventContent = '';
      if (event.type === 'big_spender') {
        const name = getBigSpenderName();
        const gift = getRandomGift();
        eventContent = `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 16px;">${gift.emoji}</div>
            <h2 style="font-size: 2rem; font-weight: 800; color: #ffd700; margin-bottom: 8px;">土豪驾到！</h2>
            <p style="font-size: 1.2rem; margin-bottom: 20px;">榜一大佬 <strong>${name}</strong> 送来 ${gift.name}！</p>
            <div style="display: flex; gap: 16px; justify-content: center;">
              <div style="background: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 12px;">
                <div style="color: #4ade80; font-weight: 700;">+${PlayerData.formatNumber(impact.followers)}</div>
                <div style="font-size: 0.75rem; opacity: 0.7;">关注</div>
              </div>
              <div style="background: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 12px;">
                <div style="color: #4ade80; font-weight: 700;">+${PlayerData.formatNumber(impact.fanClub)}</div>
                <div style="font-size: 0.75rem; opacity: 0.7;">粉丝团</div>
              </div>
              <div style="background: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 12px;">
                <div style="color: #4ade80; font-weight: 700;">${PlayerData.formatMoney(impact.income)}</div>
                <div style="font-size: 0.75rem; opacity: 0.7;">收入</div>
              </div>
            </div>
          </div>
        `;
      } else if (event.type === 'pk_battle') {
        // PK事件 - 先显示对手信息弹窗
        const opponents = [
          { name: 'Bot_Slayer_99', level: 99, quote: '"我奶奶都比你强"', desc: '传说中的机器人杀手，据说从来没输过' },
          { name: '超级无敌小萌新', level: 15, quote: '"萌新求罩！"', desc: '看起来人畜无害，实际上是个狠角色' },
          { name: '直播界一哥', level: 88, quote: '"你在教我做事？"', desc: '自称直播界一哥，粉丝数是你的100倍' },
          { name: '整活王者', level: 66, quote: '"6到飞起"', desc: '整活界的传奇人物，梗图制造机' },
          { name: '神秘主播X', level: 77, quote: '"？？？"', desc: '没人知道ta的真实身份，但PK从不手软' },
          { name: '抽象带师', level: 55, quote: '"你急了你急了"', desc: '抽象文化传播者，弹幕全是问号' },
          { name: '芜湖起飞', level: 42, quote: '"起飞！"', desc: '安徽籍主播，口头禅是"芜湖起飞"' },
        ];
        const opponent = opponents[Math.floor(Math.random() * opponents.length)];
        
        eventContent = `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 16px;">⚔️</div>
            <h2 style="font-size: 2rem; font-weight: 800; color: #f4258c; margin-bottom: 16px;">PK挑战来袭！</h2>
            
            <div style="
              background: linear-gradient(135deg, rgba(0,240,255,0.2) 0%, rgba(0,128,255,0.2) 100%);
              border: 2px solid rgba(0,240,255,0.5);
              border-radius: 16px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
            ">
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                <div style="
                  width: 60px;
                  height: 60px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 2rem;
                  border: 3px solid #00f0ff;
                  box-shadow: 0 0 15px rgba(0,240,255,0.5);
                ">🤖</div>
                <div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: #00f0ff;">${opponent.name}</div>
                  <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">LVL ${opponent.level} · ${opponent.quote}</div>
                </div>
              </div>
              <p style="font-size: 0.95rem; color: rgba(255,255,255,0.9); line-height: 1.5; margin: 0;">
                ${opponent.desc}
              </p>
            </div>
            
            <p style="font-size: 0.9rem; color: rgba(255,255,255,0.6); margin-bottom: 8px;">
              准备好了吗？疯狂点击❤️按钮为自己助力！
            </p>
          </div>
        `;
        
        // 存储对手信息用于后续PK
        (event as any).opponent = opponent;
      } else {
        const eventInfo = getSuddenEvent(event.type, state.category);
        eventContent = `
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 16px;">${eventInfo.positive ? '🎉' : '😱'}</div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: ${eventInfo.positive ? '#4ade80' : '#fb923c'}; margin-bottom: 8px;">${eventInfo.title}</h2>
            <p style="font-size: 1rem; margin-bottom: 20px; max-width: 300px;">${eventInfo.text}</p>
            <div style="display: flex; gap: 16px; justify-content: center;">
              <div style="background: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 12px;">
                <div style="color: ${impact.followers >= 0 ? '#4ade80' : '#fb923c'}; font-weight: 700;">${impact.followers >= 0 ? '+' : ''}${PlayerData.formatNumber(impact.followers)}</div>
                <div style="font-size: 0.75rem; opacity: 0.7;">关注</div>
              </div>
              <div style="background: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 12px;">
                <div style="color: ${impact.income >= 0 ? '#4ade80' : '#fb923c'}; font-weight: 700;">${impact.income >= 0 ? '+' : ''}${PlayerData.formatMoney(Math.abs(impact.income))}</div>
                <div style="font-size: 0.75rem; opacity: 0.7;">收入</div>
              </div>
            </div>
          </div>
        `;
      }

      const isPKEvent = event.type === 'pk_battle';
      const buttonText = isPKEvent ? '⚔️ 开始PK！' : '知道了！';
      
      eventPopup.innerHTML = `
        <div style="
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        ">
          <div style="
            background: linear-gradient(180deg, #2b1420 0%, #341826 100%);
            border: 4px solid ${isPKEvent ? '#00f0ff' : '#422233'};
            border-radius: 24px;
            padding: 32px;
            max-width: 420px;
            box-shadow: ${isPKEvent ? '0 0 30px rgba(0,240,255,0.3)' : '8px 8px 0 rgba(0,0,0,0.5)'};
          ">
            ${eventContent}
            <button id="btn-close-event" style="
              margin-top: 24px;
              width: 100%;
              padding: 16px;
              background: ${isPKEvent ? 'linear-gradient(135deg, #f4258c 0%, #d61a75 100%)' : '#f4258c'};
              border: none;
              border-radius: 50px;
              color: white;
              font-weight: 700;
              font-size: ${isPKEvent ? '1.1rem' : '1rem'};
              cursor: pointer;
              ${isPKEvent ? 'box-shadow: 0 0 20px rgba(244,37,140,0.5);' : ''}
            ">${buttonText}</button>
          </div>
        </div>
      `;
      eventPopup.style.display = 'block';

      // PK事件不在这里应用数值变化，而是在PK结束后应用
      if (!isPKEvent) {
        this.playerData.addFollowers(impact.followers);
        this.playerData.addFanClub(impact.fanClub);
        this.playerData.addIncome(impact.income);
      }

      eventPopup.querySelector('#btn-close-event')?.addEventListener('click', () => {
        eventPopup.style.display = 'none';
        eventPopup.innerHTML = '';
        
        if (isPKEvent) {
          // PK事件 - 进入PK界面
          this.startPKBattle(event, impact, eventIndex, events, danmakuInterval, commentInterval, showEvent);
        } else {
          // 继续下一个事件
          eventIndex++;
          if (eventIndex < events.length) {
            setTimeout(() => showEvent(events[eventIndex]), 3000 + Math.random() * 2000);
          } else {
            // 所有事件结束，自动结束直播
            setTimeout(() => {
              clearInterval(danmakuInterval);
              clearInterval(commentInterval);
              this.stateManager.changeScene('daily_summary');
            }, 2000);
          }
        }
      });
    };

    // 启动弹幕和评论
    danmakuInterval = window.setInterval(addDanmaku, 800);
    commentInterval = window.setInterval(addComment, 2000);

    // 初始添加一些
    for (let i = 0; i < 5; i++) {
      setTimeout(addDanmaku, i * 200);
      setTimeout(addComment, i * 300);
    }

    // 开始事件
    if (events.length > 0) {
      setTimeout(() => showEvent(events[0]), 3000);
    } else {
      // 没有事件，5秒后自动结束直播
      setTimeout(() => {
        clearInterval(danmakuInterval);
        clearInterval(commentInterval);
        this.stateManager.changeScene('daily_summary');
      }, 5000);
    }

    // 手动结束直播按钮（可以提前结束）
    element.querySelector('#btn-end-stream')?.addEventListener('click', () => {
      clearInterval(danmakuInterval);
      clearInterval(commentInterval);
      this.stateManager.changeScene('daily_summary');
    });
  }

  private renderDailySummary(): void {
    const state = this.playerData.getState();
    const { getDailySummary } = DefaultContent;
    const summary = getDailySummary();
    const base = state.stageId;
    
    const followerChange = Math.round((50 + Math.random() * 250) * base);
    const fanClubChange = Math.round((3 + Math.random() * 17) * base);
    const incomeChange = Math.round((200 + Math.random() * 1300) * base);

    // 每日生存开销
    const dailyExpenses = { rent: 100, utilities: 20, food: 30, internet: 10 };
    const totalExpense = dailyExpenses.rent + dailyExpenses.utilities + dailyExpenses.food + dailyExpenses.internet;

    // 应用变化
    this.playerData.addFollowers(followerChange);
    this.playerData.addFanClub(fanClubChange);
    this.playerData.addIncome(incomeChange);
    this.playerData.addExp(50 + Math.round(Math.random() * 50));

    // 实际扣除每日生存开销
    this.playerData.addIncome(-totalExpense);

    // 获取生存系统状态
    const survivalState = state.survival || { rentDue: 0, utilitiesDue: 0, foodDays: 0, internetDue: 0 };

    const html = `
      <div class="daily-summary" style="
        width: 100vw;
        height: 100vh;
        background: linear-gradient(180deg, #221019 0%, #2d1522 100%);
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        box-sizing: border-box;
        overflow-y: auto;
      ">
        <div style="max-width: 700px; width: 100%;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="
              background: rgba(244,37,140,0.2);
              color: #f4258c;
              padding: 8px 20px;
              border-radius: 20px;
              font-size: 0.85rem;
              font-weight: 700;
              text-transform: uppercase;
            ">Daily Recap</span>
            <h1 style="font-size: 2.5rem; font-weight: 900; margin-top: 16px;">Day ${state.currentDay} 结算</h1>
            <p style="color: #cb90ad; margin-top: 8px;">${summary}</p>
          </div>

          <!-- 收入统计 -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #2d1522; border-radius: 16px; padding: 24px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
              <div style="color: #60a5fa; font-size: 1.5rem; margin-bottom: 8px;">👥</div>
              <div style="font-size: 2rem; font-weight: 800;">${PlayerData.formatNumber(state.followers)}</div>
              <div style="color: #4ade80; font-size: 0.9rem; font-weight: 600;">+${followerChange}</div>
              <div style="color: #cb90ad; font-size: 0.75rem; margin-top: 4px;">关注量</div>
            </div>
            <div style="background: #2d1522; border-radius: 16px; padding: 24px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
              <div style="color: #f4258c; font-size: 1.5rem; margin-bottom: 8px;">⭐</div>
              <div style="font-size: 2rem; font-weight: 800;">${PlayerData.formatNumber(state.fanClub)}</div>
              <div style="color: #4ade80; font-size: 0.9rem; font-weight: 600;">+${fanClubChange}</div>
              <div style="color: #cb90ad; font-size: 0.75rem; margin-top: 4px;">粉丝团</div>
            </div>
            <div style="background: #2d1522; border-radius: 16px; padding: 24px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
              <div style="color: #fbbf24; font-size: 1.5rem; margin-bottom: 8px;">💰</div>
              <div style="font-size: 2rem; font-weight: 800;">${PlayerData.formatMoney(state.income)}</div>
              <div style="color: #4ade80; font-size: 0.9rem; font-weight: 600;">+¥${incomeChange}</div>
              <div style="color: #cb90ad; font-size: 0.75rem; margin-top: 4px;">收入</div>
            </div>
          </div>

          <!-- 生存支出明细 -->
          <div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
            <h3 style="font-size: 1rem; color: #f49d25; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              <span>🏠</span> 每日支出
            </h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <span style="color: #a0a0a0;">🏠 房租</span>
                <span style="color: #ef4444; font-weight: 600;">-¥${dailyExpenses.rent}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <span style="color: #a0a0a0;">💡 水电费</span>
                <span style="color: #ef4444; font-weight: 600;">-¥${dailyExpenses.utilities}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <span style="color: #a0a0a0;">🍚 食物</span>
                <span style="color: #ef4444; font-weight: 600;">-¥${dailyExpenses.food}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <span style="color: #a0a0a0;">🌐 网费</span>
                <span style="color: #ef4444; font-weight: 600;">-¥${dailyExpenses.internet}</span>
              </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #a0a0a0;">今日总支出</span>
              <span style="color: #ef4444; font-size: 1.2rem; font-weight: 700;">-¥${totalExpense}</span>
            </div>
          </div>

          <!-- 拖欠状态警告 -->
          ${(survivalState.rentDue > 0 || survivalState.utilitiesDue > 0 || survivalState.foodDays > 0) ? `
          <div style="background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <h4 style="color: #ef4444; font-size: 0.95rem; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>⚠️</span> 拖欠警告
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${survivalState.rentDue > 0 ? `<span style="background: rgba(239,68,68,0.3); color: #fca5a5; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem;">房租拖欠 ${survivalState.rentDue} 天</span>` : ''}
              ${survivalState.utilitiesDue > 0 ? `<span style="background: rgba(239,68,68,0.3); color: #fca5a5; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem;">水电拖欠 ${survivalState.utilitiesDue} 天</span>` : ''}
              ${survivalState.foodDays > 0 ? `<span style="background: rgba(245,158,11,0.3); color: #fcd34d; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem;">未进食 ${survivalState.foodDays} 天</span>` : ''}
            </div>
          </div>
          ` : ''}

          <div style="text-align: center;">
            <button id="btn-next-day" style="
              padding: 18px 80px;
              background: linear-gradient(135deg, #f4258c 0%, #ff4d8d 100%);
              border: none;
              border-radius: 50px;
              color: white;
              font-size: 1.2rem;
              font-weight: 700;
              cursor: pointer;
              box-shadow: 0 8px 30px rgba(244,37,140,0.4);
            ">开始新的一天 →</button>
          </div>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    element.querySelector('#btn-next-day')?.addEventListener('click', async () => {
      this.aiService.clearCache();
      this.playerData.advanceDay();
      
      // 检查游戏是否结束（第20天触发双面人生结局）
      const state = this.playerData.getState();
      if (state.currentDay >= 20) {
        // 触发双面人生结局
        await this.handleDoubleLifeEnding();
        return;
      }
      
      // 双面人生每日流程
      this.handleDoubleLifeDailyFlow();
    });
  }

  /**
   * 双面人生每日流程
   * 简化：仅重置每日事件标志，然后进入直播策划。
   * 所有剧情/NPC/随机/生存事件统一在 main_hub 的 checkAndShowDailyEvents 中处理。
   */
  private handleDoubleLifeDailyFlow(): void {
    this.dailyEventsShown = false;
    this.stateManager.changeScene('stream_planning');
  }

  /**
   * 显示生存危机
   */
  private async showSurvivalCrisis(crisis: any): Promise<void> {
    return new Promise((resolve) => {
      this.renderSurvivalCrisis(crisis, () => {
        resolve();
      });
    });
  }

  /**
   * 显示NPC对话
   */
  private async showNPCDialog(interaction: any): Promise<void> {
    return new Promise((resolve) => {
      if (interaction.choices && interaction.choices.length > 0) {
        // 有选择的对话
        const html = `
          <div class="double-life-dialog">
            <div class="npc-portrait">${this.npcSystem.getNPCPortrait(interaction.npcId)}</div>
            <div class="dialog-box animate-slide-up">
              <div class="dialog-speaker">${interaction.npcName}</div>
              <div class="dialog-text">${interaction.dialog}</div>
              <div class="dialog-choices">
                ${interaction.choices.map((choice: any) => `
                  <button class="choice-btn" data-choice-id="${choice.id}">${choice.text}</button>
                `).join('')}
              </div>
            </div>
            ${this.renderCharacterPortrait(interaction.emotion, 'right')}
          </div>
        `;
        this.showOverlay(html);

        // 绑定选择事件
        document.querySelectorAll('.choice-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const choiceId = (e.currentTarget as HTMLElement).dataset.choiceId;
            const choice = interaction.choices.find((c: any) => c.id === choiceId);
            if (choice) {
              this.npcSystem.applyChoiceEffects(choice, interaction.npcId);
              this.hideOverlay();
              resolve();
            }
          });
        });
      } else {
        // 无选择的对话
        this.renderNPCDialog(interaction.npcId, interaction.npcName, interaction.dialog, interaction.emotion, () => {
          resolve();
        });
      }
    });
  }

  /**
   * 显示剧情节点
   */
  private async showStoryNode(node: any): Promise<void> {
    return new Promise((resolve) => {
      const html = `
        <div class="double-life-dialog">
          <div class="dialog-box animate-slide-up">
            <div class="dialog-text">${node.dialog}</div>
            <div class="dialog-choices">
              ${node.choices.map((choice: any) => `
                <button class="choice-btn" data-choice-id="${choice.id}">${choice.text}</button>
              `).join('')}
            </div>
          </div>
          ${this.renderCharacterPortrait(node.emotion, 'right')}
        </div>
      `;
      this.showOverlay(html);

      // 绑定选择事件
      document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const choiceId = (e.currentTarget as HTMLElement).dataset.choiceId;
          const choice = node.choices.find((c: any) => c.id === choiceId);
          if (choice) {
            // 应用效果
            if (choice.effects.followers) this.playerData.addFollowers(choice.effects.followers);
            if (choice.effects.kindness) this.playerData.addKindness(choice.effects.kindness);
            if (choice.effects.integrity) this.playerData.addIntegrity(choice.effects.integrity);
            if (choice.effects.sanity) this.playerData.addSanity(choice.effects.sanity);
            if (choice.effects.money) this.playerData.addIncome(choice.effects.money);
            if (choice.effects.npcRelation) {
              this.playerData.addNPCRelation(
                choice.effects.npcRelation.npcId as any,
                choice.effects.npcRelation.change
              );
            }
            if (choice.effects.personaIntegrity) {
              this.playerData.addPersonaIntegrity(choice.effects.personaIntegrity);
            }

            // 记录选择
            this.playerData.recordStoryChoice(node.id, choice.id);
            gameLogger.logStoryChoice(node, choice);

            // 检查是否生成热搜
            if (node.isMajor && Math.random() < 0.7) {
              const hotSearch = this.hotSearchSystem.generateFromStoryNode(node);
              if (hotSearch) {
                gameLogger.logHotSearch(hotSearch);
                this.hideOverlay();
                this.renderHotSearch(hotSearch, () => {
                  resolve();
                });
                return;
              }
            }

            this.hideOverlay();
            resolve();
          }
        });
      });
    });
  }

  /**
   * 显示随机事件
   */
  private async showRandomEvent(event: any): Promise<void> {
    return new Promise((resolve) => {
      const html = `
        <div class="double-life-dialog">
          <div class="dialog-box animate-slide-up">
            <div class="dialog-text">${event.dialog}</div>
            <div class="dialog-choices">
              ${event.choices.map((choice: any) => `
                <button class="choice-btn" data-choice-id="${choice.id}">${choice.text}</button>
              `).join('')}
            </div>
          </div>
          ${this.renderCharacterPortrait(event.emotion, 'right')}
        </div>
      `;
      this.showOverlay(html);

      // 绑定选择事件
      document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const choiceId = (e.currentTarget as HTMLElement).dataset.choiceId;
          const choice = event.choices.find((c: any) => c.id === choiceId);
          if (choice) {
            // 应用效果
            if (choice.effects.followers) this.playerData.addFollowers(choice.effects.followers);
            if (choice.effects.kindness) this.playerData.addKindness(choice.effects.kindness);
            if (choice.effects.integrity) this.playerData.addIntegrity(choice.effects.integrity);
            if (choice.effects.sanity) this.playerData.addSanity(choice.effects.sanity);
            if (choice.effects.money) this.playerData.addIncome(choice.effects.money);
            if (choice.effects.failCount) this.playerData.incrementFailCount();
            if (choice.effects.personaIntegrity) {
              this.playerData.addPersonaIntegrity(choice.effects.personaIntegrity);
            }

            gameLogger.logRandomEventChoice(event, choice);

            // 检查是否生成热搜
            if (choice.hotSearchChance && Math.random() < choice.hotSearchChance) {
              const hotSearch = this.hotSearchSystem.generate(event.id);
              if (hotSearch) {
                gameLogger.logHotSearch(hotSearch);
                this.hideOverlay();
                this.renderHotSearch(hotSearch, () => {
                  resolve();
                });
                return;
              }
            }

            this.hideOverlay();
            resolve();
          }
        });
      });
    });
  }

  /**
   * 处理双面人生结局
   */
  private async handleDoubleLifeEnding(): Promise<void> {
    const ending = this.endingSystem.determineEnding();
    gameLogger.logEnding(ending);

    // 显示结局
    await new Promise<void>((resolve) => {
      this.renderEnding(ending, () => {
        resolve();
      });
    });

    // 显示滚动报幕
    this.creditsSystem.play(ending, () => {
      // 返回开始界面
      this.stateManager.changeScene('start');
    });
  }

  private startPKBattle(
    event: any,
    impact: { followers: number; fanClub: number; income: number },
    eventIndex: number,
    events: any[],
    danmakuInterval: number,
    commentInterval: number,
    showEventCallback: (event: any) => void
  ): void {
    const state = this.playerData.getState();
    const stage = this.playerData.getStage();
    
    // 使用事件中存储的对手信息（由弹窗时生成）
    const opponent = event.opponent || { name: '神秘对手', level: 50, quote: '"..."' };
    
    // PK状态
    let playerScore = 0;
    let opponentScore = 0;
    let timeLeft = 13; // 3秒准备 + 10秒PK
    let isStarted = false;
    let pkEnded = false;
    
    // 创建PK叠加层（半透明，不遮挡直播内容）
    const pkOverlay = document.createElement('div');
    pkOverlay.id = 'pk-overlay';
    pkOverlay.innerHTML = `
      <div style="
        position: fixed;
        inset: 0;
        z-index: 500;
        pointer-events: none;
        font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
        color: white;
      ">
        <!-- 顶部分屏效果（半透明渐变） -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 35%;
          display: flex;
          pointer-events: none;
        ">
          <!-- 玩家侧（红色半透明） -->
          <div style="
            width: 50%;
            height: 100%;
            background: linear-gradient(180deg, rgba(244,37,140,0.4) 0%, transparent 100%);
            border-right: 2px solid rgba(255,255,255,0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 80px;
          ">
            <div style="
              width: 80px;
              height: 80px;
              border-radius: 50%;
              border: 3px solid #f4258c;
              box-shadow: 0 0 20px rgba(244,37,140,0.6);
              background: linear-gradient(135deg, #f4258c 0%, #ff6b9d 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2.5rem;
              margin-bottom: 8px;
            ">🎤</div>
            <h3 style="font-size: 1rem; font-weight: 800; text-shadow: 0 2px 8px rgba(0,0,0,0.8);">StarStreamer</h3>
            <span style="font-size: 0.7rem; color: #fbbf24;">⭐ LVL ${state.level}</span>
          </div>
          
          <!-- 对手侧（青色半透明） -->
          <div style="
            width: 50%;
            height: 100%;
            background: linear-gradient(180deg, rgba(0,240,255,0.4) 0%, transparent 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 80px;
          ">
            <div style="
              width: 80px;
              height: 80px;
              border-radius: 50%;
              border: 3px solid #00f0ff;
              box-shadow: 0 0 20px rgba(0,240,255,0.6);
              background: linear-gradient(135deg, #00f0ff 0%, #0080ff 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2.5rem;
              margin-bottom: 8px;
            ">🤖</div>
            <h3 style="font-size: 1rem; font-weight: 800; text-shadow: 0 2px 8px rgba(0,0,0,0.8);">${opponent.name}</h3>
            <span style="font-size: 0.7rem; color: #00f0ff;">LVL ${opponent.level} · ${opponent.quote}</span>
          </div>
        </div>
        
        <!-- 顶部HUD -->
        <div style="
          position: absolute;
          top: 10px;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 24px;
          pointer-events: auto;
        ">
          <!-- 倒计时 -->
          <div style="
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(12px);
            border: 2px solid rgba(255,255,255,0.2);
            padding: 6px 16px;
            border-radius: 50px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          ">
            <span style="color: #ef4444; animation: pulse 1s infinite;">🔴</span>
            <span style="font-size: 0.8rem; font-weight: 600;">PK</span>
            <span id="pk-timer" style="font-size: 1.2rem; font-family: monospace; font-weight: 700; letter-spacing: 2px;">准备...</span>
          </div>
          
          <!-- 分数条 -->
          <div style="
            width: 100%;
            max-width: 500px;
            height: 40px;
            background: rgba(0,0,0,0.8);
            border-radius: 50px;
            padding: 3px;
            position: relative;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            border: 2px solid rgba(255,255,255,0.1);
          ">
            <div id="pk-bar-player" style="
              height: 100%;
              border-radius: 50px 0 0 50px;
              background: linear-gradient(90deg, #a21155 0%, #f4258c 100%);
              width: 50%;
              transition: width 0.3s;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 12px;
            ">
              <span style="font-size: 0.7rem; font-weight: 800;">YOU</span>
              <span id="pk-score-player" style="font-size: 0.9rem; font-weight: 700;">0</span>
            </div>
            
            <!-- VS徽章 -->
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 44px;
              height: 44px;
              background: linear-gradient(135deg, #1a0b12 0%, #2a121f 100%);
              border-radius: 50%;
              border: 2px solid rgba(255,255,255,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 16px rgba(0,0,0,0.5);
              z-index: 10;
            ">
              <span style="font-weight: 900; font-style: italic; font-size: 1rem;">VS</span>
              <div id="pk-status" style="
                position: absolute;
                bottom: -16px;
                background: #f4258c;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.55rem;
                font-weight: 700;
                text-transform: uppercase;
                white-space: nowrap;
              ">准备中</div>
            </div>
            
            <div style="
              position: absolute;
              top: 3px;
              right: 3px;
              bottom: 3px;
              left: 50%;
              border-radius: 0 50px 50px 0;
              background: linear-gradient(90deg, #00f0ff 0%, #0066aa 100%);
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 12px;
            ">
              <span id="pk-score-opponent" style="font-size: 0.9rem; font-weight: 700; color: rgba(0,0,0,0.8);">0</span>
              <span style="font-size: 0.7rem; font-weight: 800; color: rgba(0,0,0,0.8);">THEM</span>
            </div>
          </div>
        </div>
        
        <!-- 底部助力按钮 -->
        <div style="
          position: absolute;
          bottom: 100px;
          right: 20px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          pointer-events: auto;
        ">
          <button id="pk-boost-btn" style="
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f4258c 0%, #d61a75 100%);
            border: 3px solid rgba(255,255,255,0.3);
            box-shadow: 0 0 30px rgba(244,37,140,0.6);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            transition: all 0.1s;
            opacity: 0.5;
            pointer-events: none;
          ">❤️</button>
          
          <div style="
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(8px);
            padding: 4px 12px;
            border-radius: 50px;
            border: 1px solid rgba(244,37,140,0.3);
            text-align: center;
          ">
            <div style="font-size: 0.6rem; color: rgba(255,255,255,0.6);">贡献</div>
            <div id="pk-contribution-value" style="font-size: 0.9rem; font-weight: 700;">0</div>
          </div>
        </div>
        
        <!-- 中央倒计时（开始前显示） -->
        <div id="pk-countdown" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 200;
          font-size: 6rem;
          font-weight: 900;
          color: white;
          text-shadow: 0 0 40px rgba(244,37,140,0.8), 0 0 80px rgba(244,37,140,0.4);
          display: none;
          pointer-events: none;
        ">3</div>
        
        <!-- 结果显示 -->
        <div id="pk-result" style="
          position: absolute;
          inset: 0;
          z-index: 300;
          background: rgba(0,0,0,0.85);
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          pointer-events: auto;
        "></div>
      </div>
      
      <style>
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        #pk-boost-btn:active { transform: scale(0.9); box-shadow: 0 0 20px rgba(244,37,140,0.8); }
      </style>
    `;
    
    document.body.appendChild(pkOverlay);
    
    const timerEl = document.getElementById('pk-timer')!;
    const statusEl = document.getElementById('pk-status')!;
    const boostBtn = document.getElementById('pk-boost-btn')!;
    const playerScoreEl = document.getElementById('pk-score-player')!;
    const opponentScoreEl = document.getElementById('pk-score-opponent')!;
    const playerBarEl = document.getElementById('pk-bar-player')!;
    const contributionEl = document.getElementById('pk-contribution-value')!;
    const countdownEl = document.getElementById('pk-countdown')!;
    const resultEl = document.getElementById('pk-result')!;
    
    let contribution = 0;
    
    // 点击助力
    boostBtn.addEventListener('click', () => {
      if (!isStarted || pkEnded) return;
      playerScore += 10 + Math.floor(Math.random() * 5);
      contribution += 10;
      contributionEl.textContent = contribution.toString();
      updateScores();
      
      // 点击动效
      boostBtn.style.transform = 'scale(1.1)';
      setTimeout(() => { boostBtn.style.transform = 'scale(1)'; }, 100);
    });
    
    const updateScores = () => {
      const total = playerScore + opponentScore || 1;
      const playerPercent = Math.min(95, Math.max(5, (playerScore / total) * 100));
      playerBarEl.style.width = playerPercent + '%';
      playerScoreEl.textContent = playerScore.toLocaleString();
      opponentScoreEl.textContent = opponentScore.toLocaleString();
      
      if (playerScore > opponentScore) {
        statusEl.textContent = '领先！';
        statusEl.style.background = '#4ade80';
      } else if (playerScore < opponentScore) {
        statusEl.textContent = '落后！';
        statusEl.style.background = '#fb923c';
      } else {
        statusEl.textContent = '平局';
        statusEl.style.background = '#fbbf24';
      }
    };
    
    // 对手自动加分
    const opponentInterval = setInterval(() => {
      if (!isStarted || pkEnded) return;
      opponentScore += 5 + Math.floor(Math.random() * 10);
      updateScores();
    }, 500);
    
    // 倒计时逻辑
    const gameInterval = setInterval(() => {
      timeLeft--;
      
      if (timeLeft > 10) {
        // 准备阶段
        countdownEl.style.display = 'block';
        countdownEl.textContent = (timeLeft - 10).toString();
        timerEl.textContent = '准备...';
      } else if (timeLeft === 10) {
        // 开始PK
        countdownEl.textContent = 'GO!';
        setTimeout(() => { countdownEl.style.display = 'none'; }, 500);
        isStarted = true;
        boostBtn.style.opacity = '1';
        boostBtn.style.pointerEvents = 'auto';
        statusEl.textContent = 'PK中';
      } else if (timeLeft > 0) {
        // PK进行中
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerEl.textContent = mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
      } else {
        // PK结束
        clearInterval(gameInterval);
        clearInterval(opponentInterval);
        pkEnded = true;
        boostBtn.style.opacity = '0.5';
        boostBtn.style.pointerEvents = 'none';
        
        const isWin = playerScore > opponentScore;
        const actualImpact = isWin 
          ? impact 
          : { followers: Math.floor(impact.followers * 0.3), fanClub: Math.floor(impact.fanClub * 0.3), income: Math.floor(impact.income * 0.3) };
        
        // 显示结果
        resultEl.style.display = 'flex';
        resultEl.innerHTML = `
          <div style="font-size: 5rem; margin-bottom: 12px;">${isWin ? '🏆' : '😅'}</div>
          <h2 style="font-size: 2.5rem; font-weight: 900; color: ${isWin ? '#4ade80' : '#fb923c'}; margin-bottom: 8px;">
            ${isWin ? 'PK胜利！' : 'PK惜败'}
          </h2>
          <p style="font-size: 1rem; color: rgba(255,255,255,0.8); margin-bottom: 20px;">
            ${isWin ? '你成功击败了对手！' : '下次再接再厉！'}
          </p>
          <div style="display: flex; gap: 20px; margin-bottom: 24px;">
            <div style="background: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 12px; text-align: center;">
              <div style="color: ${isWin ? '#4ade80' : '#fb923c'}; font-size: 1.3rem; font-weight: 700;">
                +${PlayerData.formatNumber(actualImpact.followers)}
              </div>
              <div style="font-size: 0.75rem; opacity: 0.7;">关注</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 12px; text-align: center;">
              <div style="color: ${isWin ? '#4ade80' : '#fb923c'}; font-size: 1.3rem; font-weight: 700;">
                +${PlayerData.formatNumber(actualImpact.fanClub)}
              </div>
              <div style="font-size: 0.75rem; opacity: 0.7;">粉丝团</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 12px; text-align: center;">
              <div style="color: ${isWin ? '#4ade80' : '#fb923c'}; font-size: 1.3rem; font-weight: 700;">
                ${PlayerData.formatMoney(actualImpact.income)}
              </div>
              <div style="font-size: 0.75rem; opacity: 0.7;">收入</div>
            </div>
          </div>
          <button id="pk-continue" style="
            padding: 14px 50px;
            background: linear-gradient(135deg, #f4258c 0%, #d61a75 100%);
            border: none;
            border-radius: 50px;
            color: white;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 8px 30px rgba(244,37,140,0.4);
          ">继续直播</button>
        `;
        
        // 应用数值变化
        this.playerData.addFollowers(actualImpact.followers);
        this.playerData.addFanClub(actualImpact.fanClub);
        this.playerData.addIncome(actualImpact.income);
        
        // 继续按钮
        document.getElementById('pk-continue')?.addEventListener('click', () => {
          pkOverlay.remove();
          
          // 继续处理后续事件
          const nextIndex = eventIndex + 1;
          if (nextIndex < events.length) {
            // 延迟后触发下一个事件
            setTimeout(() => {
              showEventCallback(events[nextIndex]);
            }, 2000 + Math.random() * 2000);
          } else {
            // 所有事件结束，自动结束直播
            setTimeout(() => {
              clearInterval(danmakuInterval);
              clearInterval(commentInterval);
              this.stateManager.changeScene('daily_summary');
            }, 2000);
          }
        });
      }
    }, 1000);
  }

  private renderVictory(): void {
    const state = this.playerData.getState();
    const stage = this.playerData.getStage();
    const { getFuturePrediction } = DefaultContent;
    const prediction = getFuturePrediction();

    const html = `
      <div class="victory" style="
        width: 100vw;
        height: 100vh;
        background: linear-gradient(180deg, #191022 0%, #261834 100%);
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        box-sizing: border-box;
        text-align: center;
      ">
        <!-- 背景装饰 -->
        <div style="position: absolute; top: 10%; left: 20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(140,37,244,0.2) 0%, transparent 70%); pointer-events: none;"></div>
        
        <div style="max-width: 600px;">
          <div style="
            background: rgba(37,244,238,0.2);
            padding: 8px 20px;
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 20px;
          ">
            <span style="color: #25f4ee;">✓</span>
            <span style="color: #25f4ee; font-size: 0.85rem; font-weight: 700;">CHALLENGE COMPLETE</span>
          </div>

          <h1 style="font-size: 4rem; font-weight: 900; margin-bottom: 10px; text-shadow: 0 0 40px rgba(140,37,244,0.5);">
            MISSION<br>ACCOMPLISHED
          </h1>
          <p style="font-size: 1.2rem; color: #9ca3af; margin-bottom: 40px;">20天直播生涯圆满结束！</p>

          <!-- 排名 -->
          <div style="
            width: 200px;
            height: 200px;
            background: #261834;
            border-radius: 50%;
            margin: 0 auto 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 0 60px rgba(140,37,244,0.3);
          ">
            <div style="font-size: 3rem; margin-bottom: 8px;">🏆</div>
            <div style="font-size: 0.85rem; color: #9ca3af;">最终阶段</div>
            <div style="font-size: 1.5rem; font-weight: 800;">${stage.name}</div>
          </div>

          <!-- 数据 -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px;">
            <div style="background: rgba(140,37,244,0.1); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.05);">
              <div style="color: #a855f7; margin-bottom: 8px;">👥</div>
              <div style="font-size: 1.5rem; font-weight: 800;">${PlayerData.formatNumber(state.followers)}</div>
              <div style="font-size: 0.75rem; color: #9ca3af;">总关注</div>
            </div>
            <div style="background: rgba(34,197,94,0.1); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.05);">
              <div style="color: #22c55e; margin-bottom: 8px;">💰</div>
              <div style="font-size: 1.5rem; font-weight: 800;">${PlayerData.formatMoney(state.income)}</div>
              <div style="font-size: 0.75rem; color: #9ca3af;">总收入</div>
            </div>
            <div style="background: rgba(255,77,141,0.1); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.05);">
              <div style="color: #ff4d8d; margin-bottom: 8px;">⭐</div>
              <div style="font-size: 1.5rem; font-weight: 800;">${PlayerData.formatNumber(state.fanClub)}</div>
              <div style="font-size: 0.75rem; color: #9ca3af;">粉丝团</div>
            </div>
          </div>

          <!-- 未来预测 -->
          <div style="
            background: #261834;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 40px;
            text-align: left;
            border: 1px solid rgba(255,255,255,0.1);
          ">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span style="color: #a855f7;">🔮</span>
              <span style="font-weight: 700;">未来预言</span>
            </div>
            <p style="color: #c4b5fd; line-height: 1.8;">"${prediction}"</p>
          </div>

          <button id="btn-play-again" style="
            padding: 18px 60px;
            background: linear-gradient(135deg, #8c25f4 0%, #a855f7 100%);
            border: none;
            border-radius: 50px;
            color: white;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 8px 30px rgba(140,37,244,0.4);
          ">再玩一次</button>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    element.querySelector('#btn-play-again')?.addEventListener('click', () => {
      this.playerData.reset();
      this.aiService.clearCache();
      this.stateManager.reset();
    });
  }

  private renderGameOver(): void {
    const state = this.playerData.getState();

    const html = `
      <div class="game-over" style="
        width: 100vw;
        height: 100vh;
        background: linear-gradient(180deg, #221510 0%, #1a0f0a 100%);
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: #2a1d18;
          border-radius: 40px;
          padding: 40px;
          max-width: 400px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        ">
          <div style="
            width: 100px;
            height: 100px;
            background: #3a251e;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 4px solid #482c23;
          ">
            <span style="font-size: 4rem;">💀</span>
          </div>

          <h1 style="font-size: 3rem; font-weight: 900; color: #ee5b2b; margin-bottom: 8px;">BANKRUPT!</h1>
          <p style="font-size: 1.2rem; font-weight: 700; text-transform: uppercase; margin-bottom: 24px;">Game Over!</p>

          <p style="color: #c9a092; line-height: 1.6; margin-bottom: 30px;">
            收入归零了...是时候摸摸现实的鱼，找份工作先活着吧~ 📉
          </p>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 30px;">
            <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 16px;">
              <div style="font-size: 1.5rem; margin-bottom: 4px;">👥</div>
              <div style="font-size: 1.2rem; font-weight: 700;">${PlayerData.formatNumber(state.followers)}</div>
              <div style="font-size: 0.7rem; color: #8d6e63;">曾经的粉丝</div>
            </div>
            <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 16px;">
              <div style="font-size: 1.5rem; margin-bottom: 4px;">📅</div>
              <div style="font-size: 1.2rem; font-weight: 700;">${state.currentDay}天</div>
              <div style="font-size: 0.7rem; color: #8d6e63;">坚持了</div>
            </div>
          </div>

          <button id="btn-restart" style="
            width: 100%;
            padding: 16px;
            background: #ee5b2b;
            border: none;
            border-radius: 50px;
            color: white;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            margin-bottom: 12px;
          ">🔄 重新开始</button>

          <button id="btn-menu" style="
            width: 100%;
            padding: 14px;
            background: transparent;
            border: none;
            color: #c9a092;
            cursor: pointer;
          ">返回主菜单</button>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    element.querySelector('#btn-restart')?.addEventListener('click', () => {
      this.playerData.reset();
      this.aiService.clearCache();
      this.stateManager.changeScene('category_select');
    });

    element.querySelector('#btn-menu')?.addEventListener('click', () => {
      this.playerData.reset();
      this.aiService.clearCache();
      this.stateManager.reset();
    });
  }

  // ==================== 双面人生模式新方法 ====================

  /**
   * 渲染每日开场独白
   */
  renderDailyOpening(day: number, onComplete: () => void): void {
    const state = this.playerData.getState();
    const survival = this.survivalSystem;

    // 根据天数和状态生成开场白
    let monologue = '';
    let emotion = 'happy';

    if (day === 1) {
      monologue = '（揉眼睛）新的一天开始了...今天是我做主播的第1天，希望能有个好开始！';
      emotion = 'happy';
    } else if (state.sanity < 30) {
      monologue = '（疲惫地叹气）又是新的一天...我感觉自己快撑不住了...';
      emotion = 'tired';
    } else if (state.survival.rentDue > 5) {
      monologue = `（焦虑地看手机）房租已经拖欠${state.survival.rentDue}天了，房东随时可能来赶人...`;
      emotion = 'nervous';
    } else if (state.followers > 100000) {
      monologue = `（看着粉丝数微笑）已经有${PlayerData.formatNumber(state.followers)}粉丝了，但为什么我还是觉得空虚...`;
      emotion = 'smile';
    } else {
      const openings = [
        '（伸懒腰）新的一天，继续加油！',
        '（看着窗外）又是充满希望的一天。',
        '（给自己打气）今天也要努力直播！',
        '（喝口水）准备好迎接今天的挑战了。',
      ];
      monologue = openings[Math.floor(Math.random() * openings.length)];
      emotion = 'happy';
    }

    const html = `
      <div class="daily-opening">
        <div class="monologue-box animate-slide-up">
          <div class="day-indicator">Day ${day}</div>
          <div class="monologue-text">${monologue}</div>
          <div style="margin-top: 24px; font-size: 0.9rem; color: #888;">
            ${survival.getSurvivalSummary?.() || ''}
          </div>
        </div>
        ${this.renderCharacterPortrait(emotion, 'right')}
      </div>
    `;

    this.showOverlay(html);

    // 3秒后自动继续
    setTimeout(() => {
      this.hideOverlay();
      onComplete();
    }, 3000);
  }

  /**
   * 渲染剧情事件
   */
  renderStoryNode(node: import('../events/StoryNodes').StoryNode, onChoice: (choice: import('../events/StoryNodes').StoryChoice) => void): void {
    const html = `
      <div class="double-life-dialog">
        <div class="dialog-box animate-slide-up">
          <div class="dialog-text">${node.dialog}</div>
          <div class="dialog-choices">
            ${node.choices.map(choice => `
              <button class="choice-btn" data-choice-id="${choice.id}">
                ${choice.text}
              </button>
            `).join('')}
          </div>
        </div>
        ${this.renderCharacterPortrait(node.emotion, 'right')}
      </div>
    `;

    this.showOverlay(html);

    // 绑定选择事件
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const choiceId = (e.currentTarget as HTMLElement).dataset.choiceId;
        const choice = node.choices.find(c => c.id === choiceId);
        if (choice) {
          this.hideOverlay();
          onChoice(choice);
        }
      });
    });
  }

  /**
   * 渲染NPC对话
   */
  renderNPCDialog(npcId: string, npcName: string, dialog: string, emotion: string, onComplete: () => void): void {
    const npcEmojis: Record<string, string> = {
      landlady: '👵',
      kexin: '👩',
      mom: '👩‍🦳',
      doudou: '🐕',
      yueya: '👸',
      harasser: '👨',
    };

    const html = `
      <div class="double-life-dialog">
        <div class="npc-portrait">${npcEmojis[npcId] || '👤'}</div>
        <div class="dialog-box animate-slide-up">
          <div class="dialog-speaker">${npcName}</div>
          <div class="dialog-text">${dialog}</div>
          <button class="choice-btn" id="npc-dialog-continue" style="margin-top: 16px;">
            继续
          </button>
        </div>
        ${this.renderCharacterPortrait(emotion, 'right')}
      </div>
    `;

    this.showOverlay(html);

    document.getElementById('npc-dialog-continue')?.addEventListener('click', () => {
      this.hideOverlay();
      onComplete();
    });
  }

  /**
   * 渲染生存危机事件
   */
  renderSurvivalCrisis(crisis: import('../systems/SurvivalSystem').SurvivalCrisis, onComplete: () => void): void {
    const alertClass = crisis.level === 'critical' ? 'critical' : 'warning';

    const html = `
      <div class="survival-alert ${alertClass}">
        ⚠️ ${crisis.message}
      </div>
    `;

    this.showOverlay(html);

    setTimeout(() => {
      this.hideOverlay();
      onComplete();
    }, 3000);
  }

  /**
   * 渲染热搜
   */
  renderHotSearch(hotSearch: import('../systems/HotSearchSystem').HotSearchItem, onComplete: () => void): void {
    const html = `
      <div class="hotsearch-card animate-slide-up">
        <div class="hotsearch-rank">🔥 微博热搜 ${hotSearch.rank > 3 ? `第${hotSearch.rank}位` : 'TOP ' + hotSearch.rank}</div>
        <div class="hotsearch-keyword">${hotSearch.keyword}</div>
        <div class="hotsearch-heat">热度：${(hotSearch.heat / 10000).toFixed(1)}万</div>
        <div class="hotsearch-comment">"${hotSearch.hotComment}"</div>
      </div>
    `;

    this.showOverlay(html);

    setTimeout(() => {
      this.hideOverlay();
      onComplete();
    }, 4000);
  }

  /**
   * 渲染结局
   */
  renderEnding(ending: import('../systems/EndingSystem').EndingResult, onComplete: () => void): void {
    const html = `
      <div class="ending-scene">
        <div class="ending-title">${ending.name}</div>
        <div class="ending-description">${ending.description}</div>
        <div class="ending-truth">"${ending.truth}"</div>
        <div class="ending-epilogue">${ending.epilogue}</div>
        <button id="ending-continue" class="choice-btn" style="margin-top: 40px; padding: 16px 40px;">
          查看制作名单
        </button>
      </div>
    `;

    this.showOverlay(html);

    document.getElementById('ending-continue')?.addEventListener('click', () => {
      this.hideOverlay();
      onComplete();
    });
  }

  /**
   * 渲染角色立绘
   */
  private renderCharacterPortrait(emotion: string, position: 'left' | 'right'): string {
    const emotionMap: Record<string, string> = {
      'positive': 'happy',
      'happy': 'smile',
      'nervous': 'nervous',
      'scared': 'scared',
      'angry': 'angry',
      'disgusted': 'disgusted',
      'embarrassed': 'embarrassed',
      'panicked': 'panicked',
      'playful': 'playful',
      'tired': 'smile',
      'sad': 'scared',
      'confident': 'happy',
      'default': 'smile',
    };

    const expression = emotionMap[emotion] || 'smile';
    const positionClass = position === 'left' ? 'left' : 'right';

    return `
      <div class="character-portrait ${positionClass}">
        <img src="./portraits/${expression}.png" 
             alt="小爱"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size:100px;text-align:center;line-height:350px;\\'>👩</div>';">
      </div>
    `;
  }

  /**
   * 显示遮罩层
   */
  private showOverlay(html: string): void {
    const existingOverlay = document.getElementById('double-life-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'double-life-overlay';
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 9999; overflow: hidden; background: #1a1a2e;';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
  }

  /**
   * 隐藏遮罩层
   */
  private hideOverlay(): void {
    const overlay = document.getElementById('double-life-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * 渲染横板对话场景
   * @param dialog 对话内容
   * @param npc NPC信息（可选）
   * @returns Promise<选择的选项索引>
   */
  private async renderDialogScene(
    dialog: {
      text: string;
      speaker?: string;
      emotion?: string;
      choices?: { text: string; value: string }[];
    },
    npc?: {
      id: string;
      name: string;
      emoji?: string;
    }
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const emotion = dialog.emotion || 'default';
      const emotionMap: Record<string, string> = {
        'positive': 'happy',
        'happy': 'smile',
        'nervous': 'nervous',
        'scared': 'scared',
        'angry': 'angry',
        'disgusted': 'disgusted',
        'embarrassed': 'embarrassed',
        'panicked': 'panicked',
        'playful': 'playful',
        'tired': 'smile',
        'sad': 'scared',
        'confident': 'happy',
        'default': 'smile',
      };
      const expression = emotionMap[emotion] || 'smile';

      // NPC emoji映射
      const npcEmojiMap: Record<string, string> = {
        'landlady': '👵',
        'kexin': '👩',
        'mom': '👩‍🦳',
        'doudou': '🐕',
        'yueya': '👸',
        'harasser': '👨',
      };

      // 获取当前房间背景
      const state = this.playerData.getState();
      const isDaytime = !state.hasFinishedUpgrade;
      const bgUrl = isDaytime ? this.dayBgUrl : this.nightBgUrl;

      const html = `
        <div class="dialog-scene" id="dialog-scene" style="
          position: fixed; inset: 0; z-index: 9999;
          background-image: url('${bgUrl}');
          background-size: cover; background-position: center;
        ">
          <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);"></div>
          
          <!-- NPC立绘 - 左侧 -->
          ${npc ? `
          <div class="npc-portrait emoji-fallback" style="position:absolute;bottom:180px;left:5%;width:300px;height:400px;display:flex;align-items:flex-end;justify-content:center;z-index:101;background:rgba(255,255,255,0.1);border-radius:50%;font-size:120px;align-items:center;">
            ${npc.emoji || npcEmojiMap[npc.id] || '👤'}
          </div>
          ` : ''}
          
          <!-- 主角立绘 - 右侧 -->
          <div class="character-portrait right" style="position:absolute;bottom:180px;right:5%;width:300px;height:400px;z-index:101;display:flex;align-items:flex-end;justify-content:center;">
            <img src="./portraits/${expression}.png" 
                 alt="小爱"
                 style="max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 4px 20px rgba(0,0,0,0.5));"
                 onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size:120px;text-align:center;line-height:400px;\\'>👩</div>';">
          </div>
          
          <!-- 对话框 - 底部 -->
          <div class="dialog-box">
            ${dialog.speaker ? `<div class="dialog-speaker">${dialog.speaker}</div>` : ''}
            <div class="dialog-text">${dialog.text}</div>
            
            ${dialog.choices && dialog.choices.length > 0 ? `
            <div class="dialog-choices">
              ${dialog.choices.map((choice, index) => `
                <button class="choice-btn" data-value="${choice.value}" data-index="${index}">
                  ${choice.text}
                </button>
              `).join('')}
            </div>
            ` : `
            <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
              <button id="btn-dialog-continue" style="
                padding: 10px 24px;
                background: linear-gradient(135deg, #f49d25 0%, #ffb95e 100%);
                border: none;
                border-radius: 20px;
                color: white;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
              ">继续</button>
            </div>
            `}
          </div>
        </div>
      `;

      this.showOverlay(html);

      // 绑定选项按钮事件
      if (dialog.choices && dialog.choices.length > 0) {
        const choiceBtns = document.querySelectorAll('.choice-btn');
        choiceBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const value = (e.target as HTMLElement).dataset.value;
            this.hideOverlay();
            resolve(value || null);
          });
        });
      } else {
        // 绑定继续按钮
        const continueBtn = document.getElementById('btn-dialog-continue');
        if (continueBtn) {
          continueBtn.addEventListener('click', () => {
            this.hideOverlay();
            resolve(null);
          });
        }
      }
    });
  }

  /**
   * 显示每日开场独白
   */
  private async showDailyOpening(): Promise<void> {
    const state = this.playerData.getState();
    const day = state.currentDay;

    // 根据天数和状态决定情绪和文本
    let emotion = 'smile';
    let text = '';

    if (day === 1) {
      emotion = 'nervous';
      text = '（揉眼睛）这是...我真的穿越了？\n不管怎样，先努力活下去吧！';
    } else if (state.sanity < 30) {
      emotion = 'scared';
      text = '（疲惫）又是新的一天...\n感觉精神快要崩溃了...';
    } else if (state.income < 0) {
      emotion = 'nervous';
      text = '（叹气）欠的钱越来越多了...\n得想办法多赚点。';
    } else {
      emotion = 'smile';
      text = '（伸懒腰）新的一天开始了！\n今天也要加油直播！';
    }

    await this.renderDialogScene({
      text,
      emotion
    });
  }

  /**
   * 显示开场动画（完整立绘）- 穿越剧情
   */
  private async showOpeningScene(): Promise<void> {
    return new Promise((resolve) => {
      // 剧情步骤
      const storySteps = [
        {
          title: '',
          text: '你是一名普通的大学生，也是主播"小爱"的忠实粉丝。\n\n100天前，小爱突然停播，没有任何解释。\n\n今天，你收到了直播推送...',
          emotion: '微笑',
          isSystem: false
        },
        {
          title: '',
          text: '屏幕上，小爱的身影逐渐模糊...\n\n一阵眩晕袭来...',
          emotion: '惊慌',
          isSystem: false
        },
        {
          title: '【系统提示】',
          text: '检测到强烈执念，启动穿越程序...\n绑定角色：林小爱\n任务：走完她的人生之路，找到停播的真相',
          emotion: '紧张',
          isSystem: true
        },
        {
          title: '',
          text: '你睁开眼睛，发现自己坐在简陋的出租屋里。\n\n面前是一台老旧的电脑，屏幕上显示着直播界面。\n\n这是...小爱刚起步的第1天？',
          emotion: '紧张',
          isSystem: false
        }
      ];

      let currentStep = 0;

      const showStep = () => {
        const step = storySteps[currentStep];
        const isLastStep = currentStep === storySteps.length - 1;

        const html = `
          <div id="opening-scene" style="
            position: fixed;
            inset: 0;
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          ">
            <!-- 完整立绘背景 -->
            <div style="
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0.3;
            ">
              <img src="./portraits/character-full.png" 
                    alt="小爱"
                    style="
                      max-height: 90vh;
                      max-width: 100%;
                      object-fit: contain;
                      filter: blur(2px) drop-shadow(0 10px 40px rgba(0,0,0,0.5));
                    "
                    onerror="this.style.display='none';">
            </div>
            
            <!-- 对话框 -->
            <div style="
              position: relative;
              z-index: 10;
              width: 80%;
              max-width: 700px;
              background: rgba(0, 0, 0, 0.85);
              border-radius: 16px;
              padding: 32px 40px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.5);
              animation: fadeIn 0.5s ease;
            ">
              ${step.title ? `<div style="color: #f49d25; font-size: 0.9rem; margin-bottom: 12px; font-weight: 600;">${step.title}</div>` : ''}
              <div style="
                color: white;
                font-size: 1.2rem;
                line-height: 1.8;
                margin-bottom: 24px;
                white-space: pre-line;
              ">${step.text}</div>
              
              <div style="display: flex; justify-content: flex-end;">
                <button id="btn-next-step" style="
                  padding: 12px 32px;
                  background: linear-gradient(135deg, #f49d25 0%, #ffb95e 100%);
                  border: none;
                  border-radius: 25px;
                  color: white;
                  font-size: 1rem;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                ">${isLastStep ? '开始游戏' : '下一步'}</button>
              </div>
            </div>
            
            <!-- 步骤指示器 -->
            <div style="
              position: absolute;
              bottom: 40px;
              display: flex;
              gap: 8px;
            ">
              ${storySteps.map((_, i) => `
                <div style="
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: ${i === currentStep ? '#f49d25' : 'rgba(255,255,255,0.3)'}"></div>
              `).join('')}
            </div>
            
            <style>
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              #btn-next-step:hover {
                transform: scale(1.05);
                box-shadow: 0 8px 20px rgba(244,157,37,0.4);
              }
            </style>
          </div>
        `;

        // 清除之前的内容
        const existingScene = document.getElementById('opening-scene');
        if (existingScene) {
          existingScene.remove();
        }

        // 显示当前步骤
        const sceneDiv = document.createElement('div');
        sceneDiv.innerHTML = html;
        document.body.appendChild(sceneDiv);

        // 绑定按钮事件
        const nextBtn = document.getElementById('btn-next-step');
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            if (isLastStep) {
              sceneDiv.remove();
              resolve();
            } else {
              currentStep++;
              showStep();
            }
          });
        }
      };

      // 开始显示第一步
      showStep();
    });
  }

  // ==================== 电脑桌面APP系统 ====================

  private openApps: Set<string> = new Set();

  /**
   * 渲染电脑桌面
   */
  private renderComputerDesktop(): void {
    console.log('[DEBUG] renderComputerDesktop 被调用');
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const html = `
      <div class="computer-desktop" id="computer-desktop">
        <!-- Windows风格桌面背景 -->
        <div class="desktop-wallpaper"></div>
        
        <!-- 桌面图标区域 -->
        <div class="desktop-icons">
          <!-- 微信APP图标 -->
          <div class="desktop-icon" id="desktop-icon-wechat" data-app="wechat">
            <div class="desktop-icon-img">💬</div>
            <div class="desktop-icon-text">微信</div>
          </div>
          
          <!-- 微博APP图标 -->
          <div class="desktop-icon" id="desktop-icon-weibo" data-app="weibo">
            <div class="desktop-icon-img">📱</div>
            <div class="desktop-icon-text">微博</div>
          </div>
          
          <!-- 回收站 -->
          <div class="desktop-icon" id="desktop-icon-trash" data-app="trash">
            <div class="desktop-icon-img">🗑️</div>
            <div class="desktop-icon-text">回收站</div>
          </div>
        </div>
        
        <!-- 窗口容器 -->
        <div id="windows-container"></div>
        
        <!-- Windows任务栏 -->
        <div class="windows-taskbar">
          <div class="taskbar-left">
            <button class="start-btn" id="btn-start">🪟</button>
            <div class="taskbar-apps" id="taskbar-apps"></div>
          </div>
          <div class="taskbar-right">
            <div class="system-tray">
              <span>🔊</span>
              <span>📶</span>
            </div>
            <div class="datetime">
              <div class="time">${timeStr}</div>
              <div class="date">${now.getMonth() + 1}/${now.getDate()}</div>
            </div>
            <button class="close-desktop-btn" id="btn-close-desktop" title="关闭电脑">✕</button>
          </div>
        </div>
      </div>
    `;

    this.showOverlay(html);
    this.openApps.clear();

    // 绑定桌面图标双击事件
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      icon.addEventListener('dblclick', (e) => {
        const app = (e.currentTarget as HTMLElement).dataset.app;
        if (app === 'wechat') this.openWindow('wechat', '微信', this.renderWechatContent());
        if (app === 'weibo') this.openWindow('weibo', '微博', this.renderWeiboContent());
        if (app === 'trash') this.openWindow('trash', '回收站', '<div style="padding: 20px;">回收站是空的</div>');
      });
    });

    // 绑定关闭桌面按钮
    document.getElementById('btn-close-desktop')?.addEventListener('click', () => {
      this.hideOverlay();
      this.openApps.clear();
    });
  }

  /**
   * 打开窗口
   */
  private openWindow(id: string, title: string, content: string): void {
    if (this.openApps.has(id)) {
      // 窗口已存在，聚焦到最前
      const existingWindow = document.getElementById(`window-${id}`);
      if (existingWindow) {
        this.focusWindow(existingWindow);
      }
      return;
    }

    this.openApps.add(id);
    const container = document.getElementById('windows-container');
    if (!container) return;

    // 随机位置，避免重叠
    const randomX = 50 + Math.random() * 100;
    const randomY = 30 + Math.random() * 50;

    const windowHtml = `
      <div class="app-window" id="window-${id}" style="left: ${randomX}px; top: ${randomY}px;">
        <div class="window-titlebar" data-window-id="${id}">
          <div class="window-title">${title}</div>
          <div class="window-controls">
            <button class="win-btn minimize" data-action="minimize">−</button>
            <button class="win-btn maximize" data-action="maximize">□</button>
            <button class="win-btn close" data-action="close">×</button>
          </div>
        </div>
        <div class="window-body">
          ${content}
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', windowHtml);
    this.updateTaskbar();
    this.bindWindowEvents(id);
  }

  /**
   * 绑定窗口事件
   */
  private bindWindowEvents(windowId: string): void {
    const windowEl = document.getElementById(`window-${windowId}`);
    if (!windowEl) return;

    // 关闭按钮
    windowEl.querySelector('[data-action="close"]')?.addEventListener('click', () => {
      this.closeWindow(windowId);
    });

    // 最小化按钮
    windowEl.querySelector('[data-action="minimize"]')?.addEventListener('click', () => {
      windowEl.style.display = 'none';
      this.updateTaskbar();
    });

    // 最大化按钮
    let isMaximized = false;
    windowEl.querySelector('[data-action="maximize"]')?.addEventListener('click', () => {
      if (isMaximized) {
        windowEl.style.width = '900px';
        windowEl.style.height = '600px';
        windowEl.style.left = '50px';
        windowEl.style.top = '50px';
        windowEl.style.transform = 'none';
      } else {
        windowEl.style.width = '100%';
        windowEl.style.height = 'calc(100% - 48px)';
        windowEl.style.left = '0';
        windowEl.style.top = '0';
        windowEl.style.transform = 'none';
      }
      isMaximized = !isMaximized;
    });

    // 拖拽功能
    const titlebar = windowEl.querySelector('.window-titlebar');
    if (titlebar) {
      let isDragging = false;
      let startX = 0, startY = 0;
      let initialX = 0, initialY = 0;

      titlebar.addEventListener('mousedown', (e: Event) => {
        const mouseEvent = e as MouseEvent;
        if ((mouseEvent.target as HTMLElement).closest('.window-controls')) return;
        isDragging = true;
        startX = mouseEvent.clientX;
        startY = mouseEvent.clientY;
        const rect = windowEl.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        this.focusWindow(windowEl);
      });

      document.addEventListener('mousemove', (e: Event) => {
        const mouseEvent = e as MouseEvent;
        if (!isDragging) return;
        const dx = mouseEvent.clientX - startX;
        const dy = mouseEvent.clientY - startY;
        windowEl.style.left = `${initialX + dx}px`;
        windowEl.style.top = `${initialY + dy}px`;
        windowEl.style.transform = 'none';
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
    }

    // 点击窗口聚焦
    windowEl.addEventListener('mousedown', () => {
      this.focusWindow(windowEl);
    });

    // 绑定APP特定事件
    if (windowId === 'wechat') {
      this.bindWechatEvents(windowEl);
    } else if (windowId === 'weibo') {
      this.bindWeiboEvents(windowEl);
    }
  }

  /**
   * 绑定微信APP事件
   */
  private bindWechatEvents(windowEl: HTMLElement): void {
    // 联系人点击
    windowEl.querySelectorAll('.wechat-contact').forEach(contact => {
      contact.addEventListener('click', (e) => {
        const npcId = (e.currentTarget as HTMLElement).dataset.npc;
        if (!npcId) return;
        this.openWechatChat(npcId, windowEl);
        // 高亮选中的联系人
        windowEl.querySelectorAll('.wechat-contact').forEach(c => c.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
      });
    });
  }

  /**
   * 绑定微博APP事件
   */
  private bindWeiboEvents(windowEl: HTMLElement): void {
    // Tab切换
    windowEl.querySelectorAll('.weibo-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = (e.currentTarget as HTMLElement).dataset.tab;
        if (!targetTab) return;
        
        // 切换tab激活状态
        windowEl.querySelectorAll('.weibo-tab').forEach(t => t.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
        
        // 切换面板
        windowEl.querySelectorAll('.weibo-tab-panel').forEach(p => {
          (p as HTMLElement).style.display = 'none';
        });
        const targetPanel = windowEl.querySelector(`#tab-${targetTab}`);
        if (targetPanel) {
          (targetPanel as HTMLElement).style.display = 'block';
        }
      });
    });

    // 发布按钮
    windowEl.querySelector('#btn-post-weibo')?.addEventListener('click', () => {
      this.openWeiboPostModal();
    });
  }

  /**
   * 聚焦窗口到最前
   */
  private focusWindow(windowEl: HTMLElement): void {
    document.querySelectorAll('.app-window').forEach(w => {
      (w as HTMLElement).style.zIndex = '100';
    });
    windowEl.style.zIndex = '200';
  }

  /**
   * 关闭窗口
   */
  private closeWindow(windowId: string): void {
    const windowEl = document.getElementById(`window-${windowId}`);
    if (windowEl) {
      windowEl.remove();
      this.openApps.delete(windowId);
      this.updateTaskbar();
    }
  }

  /**
   * 更新任务栏
   */
  private updateTaskbar(): void {
    const taskbarApps = document.getElementById('taskbar-apps');
    if (!taskbarApps) return;

    taskbarApps.innerHTML = Array.from(this.openApps).map(appId => {
      const windowEl = document.getElementById(`window-${appId}`);
      const isVisible = windowEl && windowEl.style.display !== 'none';
      const icons: Record<string, string> = { wechat: '💬', weibo: '📱', trash: '🗑️' };
      return `
        <button class="taskbar-app-btn ${isVisible ? 'active' : ''}" data-app="${appId}">
          ${icons[appId] || '📄'}
        </button>
      `;
    }).join('');

    // 绑定任务栏按钮点击
    taskbarApps.querySelectorAll('.taskbar-app-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const appId = (e.currentTarget as HTMLElement).dataset.app;
        if (!appId) return;
        const windowEl = document.getElementById(`window-${appId}`);
        if (windowEl) {
          if (windowEl.style.display === 'none') {
            windowEl.style.display = 'flex';
            this.focusWindow(windowEl);
          } else if (windowEl.style.zIndex === '200') {
            windowEl.style.display = 'none';
          } else {
            this.focusWindow(windowEl);
          }
          this.updateTaskbar();
        }
      });
    });
  }

  /**
   * 渲染微信内容
   */
  private renderWechatContent(): string {
    const state = this.playerData.getState();
    const survival = state.survival || { rentDue: 0, utilitiesDue: 0 };

    const npcs = [
      { id: 'landlady', name: '房东太太', emoji: '👵', lastMsg: survival.rentDue > 0 ? `已拖欠${survival.rentDue}天房租` : '房租记得交哦', time: '12:30' },
      { id: 'kexin', name: '可心', emoji: '👩', lastMsg: '在吗？', time: '昨天' },
      { id: 'mom', name: '妈妈', emoji: '👩‍🦳', lastMsg: '注意身体', time: '昨天' },
    ];

    if (state.npcRelations?.doudou > 0) {
      npcs.push({ id: 'doudou', name: '豆豆', emoji: '🐕', lastMsg: '汪汪！', time: '10:00' });
    }

    return `
      <div class="wechat-container">
        <div class="wechat-sidebar">
          <div class="wechat-search-box">
            <input type="text" class="wechat-search-input" placeholder="搜索">
          </div>
          <div class="wechat-contact-list">
            ${npcs.map(npc => `
              <div class="wechat-contact" data-npc="${npc.id}">
                <div class="contact-avatar">${npc.emoji}</div>
                <div class="contact-info">
                  <div class="contact-name">${npc.name}</div>
                  <div class="contact-msg">${npc.lastMsg}</div>
                </div>
                <div class="contact-time">${npc.time}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="wechat-chat-area" id="wechat-chat-area">
          <div class="chat-placeholder">选择一个联系人开始聊天</div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染微博内容
   */
  private renderWeiboContent(): string {
    const hotSearches = this.hotSearchSystem.getCurrentHotSearches(10);

    return `
      <div class="weibo-container">
        <div class="weibo-tabs">
          <button class="weibo-tab active" data-tab="home">首页</button>
          <button class="weibo-tab" data-tab="hot">热搜</button>
        </div>
        <div class="weibo-content">
          <div class="weibo-tab-panel active" id="tab-home">
            <div class="weibo-posts">
              <div class="weibo-post-card">
                <div class="post-header">
                  <span class="post-avatar">👩</span>
                  <span class="post-name">林小爱</span>
                  <span class="post-time">2小时前</span>
                </div>
                <div class="post-content">今天直播很开心！感谢大家的支持～ #直播日常</div>
                <div class="post-actions">
                  <span>♥ 128</span>
                  <span>💬 32</span>
                  <span>↗ 8</span>
                </div>
              </div>
            </div>
            <button class="weibo-fab" id="btn-post-weibo">+</button>
          </div>
          <div class="weibo-tab-panel" id="tab-hot" style="display: none;">
            <div class="hotsearch-list">
              ${hotSearches.map((hot, i) => `
                <div class="hotsearch-item">
                  <span class="hot-rank ${i < 3 ? 'top' + (i + 1) : ''}">${i + 1}</span>
                  <span class="hot-keyword">${hot.keyword}</span>
                  <span class="hot-heat">${(hot.heat / 10000).toFixed(1)}万</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 打开微信聊天窗口
   */
  private openWechatChat(npcId: string, windowEl?: HTMLElement): void {
    const parent = windowEl || document.getElementById('window-wechat');
    if (!parent) return;
    const chatWindow = parent.querySelector('#wechat-chat-area');
    if (!chatWindow) return;

    const npcData: Record<string, { name: string; emoji: string }> = {
      landlady: { name: '房东太太', emoji: '👵' },
      kexin: { name: '可心', emoji: '👩' },
      mom: { name: '妈妈', emoji: '👩‍🦳' },
      doudou: { name: '豆豆', emoji: '🐕' },
    };

    const npc = npcData[npcId];
    if (!npc) return;

    const state = this.playerData.getState();
    const survival = state.survival || { rentDue: 0, utilitiesDue: 0 };

    // 生成历史消息
    const messages: { type: 'self' | 'other'; content: string }[] = [];
    
    if (npcId === 'landlady') {
      messages.push({ type: 'other', content: '小姑娘，房租是每月3000，按天算就是每天100。别忘了按时交租，不然...你懂的。' });
      if (survival.rentDue > 0) {
        messages.push({ type: 'other', content: `你已经拖欠房租${survival.rentDue}天了，请尽快缴纳！` });
      }
    } else if (npcId === 'kexin') {
      messages.push({ type: 'other', content: '嗨！我是可心，刚搬来隔壁。听说你也是主播？以后多多关照啦！' });
    } else if (npcId === 'mom') {
      messages.push({ type: 'other', content: '小爱，最近过得怎么样？不要太累了，注意身体。' });
    } else if (npcId === 'doudou') {
      messages.push({ type: 'other', content: '汪汪！（摇尾巴）' });
    }

    const isLandlady = npcId === 'landlady';
    const canPayRent = isLandlady && survival.rentDue > 0 && state.income >= 100;
    const canPayUtilities = isLandlady && survival.utilitiesDue > 0 && state.income >= 20;

    chatWindow.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; background: #f5f5f5;">
        <div style="padding: 12px 16px; border-bottom: 1px solid #e0e0e0; background: white; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 14px; font-weight: 500; color: #333;">${npc.name}</div>
          ${isLandlady ? `
          <div style="display: flex; gap: 8px;">
            <button class="btn-pay-rent" style="padding: 4px 12px; background: #07c160; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; ${!canPayRent ? 'opacity:0.5;' : ''}">交房租 ¥100</button>
            <button class="btn-pay-utilities" style="padding: 4px 12px; background: #409eff; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; ${!canPayUtilities ? 'opacity:0.5;' : ''}">交水电 ¥20</button>
          </div>
          ` : ''}
        </div>
        <div class="wechat-msg-container" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
          ${messages.map(msg => `
            <div style="display: flex; ${msg.type === 'self' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}">
              ${msg.type === 'other' ? `<div style="width: 36px; height: 36px; border-radius: 4px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 8px;">${npc.emoji}</div>` : ''}
              <div style="padding: 8px 12px; border-radius: 4px; max-width: 70%; font-size: 14px; line-height: 1.5; ${msg.type === 'self' ? 'background: #95ec69;' : 'background: white;'}">${msg.content}</div>
              ${msg.type === 'self' ? `<div style="width: 36px; height: 36px; border-radius: 4px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-left: 8px;">👩</div>` : ''}
            </div>
          `).join('')}
        </div>
        <div style="padding: 12px 16px; border-top: 1px solid #e0e0e0; background: white; display: flex; gap: 8px;">
          <input class="wechat-msg-input" type="text" placeholder="输入消息..." style="flex: 1; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px; outline: none;">
          <button class="wechat-msg-send" style="padding: 8px 16px; background: #07c160; color: white; border: none; border-radius: 4px; font-size: 14px; cursor: pointer;">发送</button>
        </div>
      </div>
    `;

    // 绑定交房租按钮
    if (isLandlady) {
      chatWindow.querySelector('.btn-pay-rent')?.addEventListener('click', () => {
        if (state.income >= 100) {
          this.playerData.addIncome(-100);
          this.playerData.updateSurvival('rentDue', -1);
          this.addWechatMessage('self', '房东太太，这是房租¥100。', chatWindow);
          setTimeout(() => {
            this.addWechatMessage('other', '收到，记得按时交租哦。', chatWindow, npc.emoji);
          }, 500);
        }
      });

      chatWindow.querySelector('.btn-pay-utilities')?.addEventListener('click', () => {
        if (state.income >= 20) {
          this.playerData.addIncome(-20);
          this.playerData.updateSurvival('utilitiesDue', -1);
          this.addWechatMessage('self', '房东太太，这是水电费¥20。', chatWindow);
          setTimeout(() => {
            this.addWechatMessage('other', '好的，水电费已收到。', chatWindow, npc.emoji);
          }, 500);
        }
      });
    }

    // 绑定发送消息
    const input = chatWindow.querySelector('.wechat-msg-input') as HTMLInputElement;
    const sendBtn = chatWindow.querySelector('.wechat-msg-send');
    
    const sendMessage = () => {
      const content = input.value.trim();
      if (!content) return;
      this.addWechatMessage('self', content, chatWindow);
      input.value = '';

      // NPC回复
      setTimeout(() => {
        const replies: Record<string, string[]> = {
          landlady: ['好的', '知道了', '记得按时交租', '年轻人要努力啊'],
          kexin: ['哈哈', '真的吗', '我也觉得', '一起加油！'],
          mom: ['照顾好自己', '妈妈想你', '注意身体', '有空回家看看'],
          doudou: ['汪汪！', '（摇尾巴）', '（舔手）', '（蹭）'],
        };
        const reply = replies[npcId][Math.floor(Math.random() * replies[npcId].length)];
        this.addWechatMessage('other', reply, chatWindow, npc.emoji);
      }, 1000);
    };

    sendBtn?.addEventListener('click', sendMessage);
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  /**
   * 添加微信消息
   */
  private addWechatMessage(type: 'self' | 'other', content: string, container?: Element, emoji?: string): void {
    const messagesContainer = container?.querySelector('.wechat-msg-container') || document.querySelector('.wechat-msg-container');
    if (!messagesContainer) return;

    const npcEmoji = emoji || '👤';
    const html = `
      <div class="wechat-message ${type}">
        <div class="wechat-avatar">${type === 'self' ? '👩' : npcEmoji}</div>
        <div class="wechat-message-content">${content}</div>
      </div>
    `;

    messagesContainer.insertAdjacentHTML('beforeend', html);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * 打开微博发布弹窗
   */
  private openWeiboPostModal(): void {
    const modal = document.createElement('div');
    modal.className = 'weibo-post-modal';
    modal.id = 'weibo-post-modal';
    modal.innerHTML = `
      <div class="weibo-post-modal-content">
        <div class="weibo-post-modal-header">
          <span class="weibo-post-modal-title">发布微博</span>
          <button class="weibo-post-modal-close" id="btn-modal-close">×</button>
        </div>
        <textarea class="weibo-post-input" id="weibo-post-content" placeholder="分享新鲜事..."></textarea>
        <div class="weibo-post-modal-actions">
          <button class="weibo-post-modal-btn cancel" id="btn-modal-cancel">取消</button>
          <button class="weibo-post-modal-btn confirm" id="btn-modal-confirm">发布</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 绑定关闭事件
    const closeModal = () => {
      modal.remove();
    };

    document.getElementById('btn-modal-close')?.addEventListener('click', closeModal);
    document.getElementById('btn-modal-cancel')?.addEventListener('click', closeModal);

    // 绑定发布事件
    document.getElementById('btn-modal-confirm')?.addEventListener('click', () => {
      const content = (document.getElementById('weibo-post-content') as HTMLTextAreaElement).value.trim();
      if (!content) return;

      // 发布帖子增加粉丝
      this.playerData.addFollowers(Math.floor(Math.random() * 50) + 20);
      
      // 关闭弹窗
      closeModal();
      
      // 刷新微博窗口内容
      const weiboWindow = document.getElementById('window-weibo');
      if (weiboWindow) {
        const body = weiboWindow.querySelector('.window-body');
        if (body) {
          body.innerHTML = this.renderWeiboContent();
          this.bindWeiboEvents(weiboWindow);
        }
      }
    });
  }
}
