/**
 * 游戏主类 - 协调所有系统
 */

import { Application } from 'pixi.js';
import { GameStateManager, type GameScene } from './GameStateManager';
import { PlayerData } from './PlayerData';
import { AIService } from '../services/AIService';
import { EventPool } from '../systems/EventPool';
import * as DefaultContent from '../services/DefaultContent';
import { DIMENSIONS, SKILL_NODES, type SkillNode, type SkillDimension } from './SkillTreeConfig';

export class Game {
  public app: Application;
  public stateManager: GameStateManager;
  public playerData: PlayerData;
  public aiService: AIService;
  public eventPool: EventPool;

  private uiContainer: HTMLElement;
  private pixiContainer: HTMLElement;
  private currentUIElement: HTMLElement | null = null;

  constructor() {
    this.app = new Application();
    this.stateManager = new GameStateManager();
    this.playerData = new PlayerData();
    this.aiService = new AIService();
    this.eventPool = new EventPool();

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
    element.querySelector('#btn-start')?.addEventListener('click', () => {
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
        ${isDaytime ? `
        <!-- 阳光效果 -->
        <div style="
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,248,220,0.3) 50%, rgba(255,255,255,0) 60%);
          pointer-events: none;
        "></div>
        ` : ''}

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

    const getNodeStatus = (node: SkillNode): 'locked' | 'available' | 'unlocked' => {
      if (unlockedNodes.has(node.id)) return 'unlocked';
      if (node.unlockCondition.requiredNodes.length === 0) return 'available';
      return node.unlockCondition.requiredNodes.every(id => unlockedNodes.has(id)) ? 'available' : 'locked';
    };

    const getDimNodes = (dimId: string) => SKILL_NODES.filter(n => n.dimensionId === dimId);

    const eloquenceNodes = getDimNodes('eloquence');
    const appearanceNodes = getDimNodes('appearance');
    const talentNodes = getDimNodes('talent');
    const knowledgeNodes = getDimNodes('knowledge');

    const makeHotspot = (node: SkillNode, pctX: number, pctY: number, size: number) => {
      const status = getNodeStatus(node);
      const dim = DIMENSIONS.find(d => d.id === node.dimensionId);
      const color = dim?.color ?? '#ccc';
      return '<div class="st-hotspot st-hotspot-' + status + '" data-id="' + node.id + '" style="left:' + pctX + '%;top:' + pctY + '%;width:' + size + 'vh;height:' + size + 'vh;--hc:' + color + ';' + '" title="' + node.name + '">' +
        '<span class="st-hs-icon">' + node.icon + '</span>' +
        (status === 'unlocked' ? '<span class="st-hs-check">✓</span>' : '') +
        '<span class="st-hs-ring"></span>' +
      '</div>';
    };

    const html = `
      <div class="skill-tree-page">
        <style>
          .skill-tree-page{width:100vw;height:100vh;overflow:hidden;position:relative;background:#ffeef2;}
          .st-bg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;}
          .st-overlay{position:absolute;inset:0;z-index:5;}
          /* 热区基础样式 */
          .st-hotspot{position:absolute;border-radius:14px;display:flex;align-items:center;justify-content:center;
            cursor:pointer;transform:translate(-50%,-50%);transition:all .25s ease;z-index:6;
            background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.25);
            backdrop-filter:blur(2px);}
          .st-hotspot:hover{background:rgba(255,255,255,0.35);transform:translate(-50%,-50%) scale(1.2);z-index:20;
            border-color:var(--hc);box-shadow:0 0 20px var(--hc)50,0 4px 16px rgba(0,0,0,0.15);}
          .st-hotspot.locked{opacity:0.25;filter:grayscale(0.7);cursor:not-allowed;}
          .st-hotspot.available{animation:hsPulse 2s ease-in-out infinite;border-style:dashed;}
          .st-hotspot.unlocked{border-color:var(--hc);border-width:2.5px;background:rgba(255,255,255,0.22);
            box-shadow:0 0 12px var(--hc)40;}
          .st-hs-icon{font-size:clamp(16px,2.2vh,30px);line-height:1;user-select:none;pointer-events:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2));}
          .st-hs-check{position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;
            background:#4ade80;color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;
            font-weight:900;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);z-index:7;}
          .st-hs-ring{position:absolute;inset:-4px;border-radius:16px;border:2px solid transparent;
            pointer-events:none;transition:border-color .3s;}
          .st-hotspot:hover .st-hs-ring{border-color:var(--hc)60;}
          @keyframes hsPulse{0%,100%{box-shadow:0 0 0 0 var(--hc)30;}50%{box-shadow:0 0 0 6px var(--hc)15,0 0 16px var(--hc)20;}}
          /* 六边形入口卡片热区 */
          .st-hex-hs{position:absolute;transform:translate(-50%,-50%);cursor:pointer;z-index:8;
            border-radius:24px;transition:all .3s ease;}
          .st-hex-hs:hover{transform:translate(-50%,-50%) scale(1.06);
            box-shadow:0 0 30px rgba(255,105,180,0.4),0 8px 32px rgba(0,0,0,0.15);}
          .st-hex-hs-left{left:21%;top:17%;width:9vh;height:10vh;
            background:rgba(255,105,180,0.06);border:2px dashed rgba(255,105,180,0.35);}
          .st-hex-hs-center{left:50%;top:19%;transform:translate(-50%,-50%);width:10.5vh;height:11.5vh;
            background:rgba(255,105,180,0.1);border:2.5px dashed rgba(255,105,180,0.45);}
          .st-hex-hs-right{right:21%;top:17%;width:9vh;height:10vh;
            background:rgba(135,206,235,0.06);border:2px dashed rgba(135,206,235,0.35);}
          /* 技能点热区 */
          .st-points-hs{position:absolute;left:50%;top:27%;transform:translateX(-50%);
            width:14vh;height:4vh;border-radius:16px;cursor:default;z-index:7;
            background:rgba(255,133,162,0.08);border:2px dashed rgba(255,133,162,0.25);}
          /* 底部按钮热区 */
          .st-btn-hs{position:absolute;cursor:pointer;z-index:8;border-radius:50%;
            transition:all .2s ease;border:2px dashed rgba(168,208,234,0.3);
            background:rgba(232,244,252,0.08);}
          .st-btn-hs:hover{background:rgba(232,244,252,0.35);transform:scale(1.15);
            border-color:rgba(168,208,234,0.6);box-shadow:0 0 12px rgba(168,208,234,0.3);}
          .st-finish-hs{position:absolute;bottom:5.5%;right:6%;padding:1.2vh 3vh;border-radius:22px;
            cursor:pointer;z-index:8;background:rgba(255,107,157,0.1);border:2px dashed rgba(255,107,157,0.35);
            transition:all .2s ease;color:transparent;font-size:0;}
          .st-finish-hs:hover{background:rgba(255,107,157,0.3);transform:scale(1.04);
            box-shadow:0 0 20px rgba(255,107,157,0.3);}
          .st-close-hs{position:absolute;top:2.2%;right:1.5%;width:3vh;height:3vh;border-radius:50%;
            cursor:pointer;z-index:10;background:rgba(232,74,127,0.08);border:2px dashed rgba(232,74,127,0.25);
            transition:all .2s;}
          .st-close-hs:hover{background:rgba(232,74,127,0.35);transform:scale(1.1);}
          /* 弹窗 */
          #st-node-modal{position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);
            display:flex;align-items:center;justify-content:center;z-index:9999;}
          #st-node-modal.hidden{display:none;}
          .st-modal-card{background:#fff;border-radius:22px;padding:26px 30px;max-width:370px;width:88%;
            box-shadow:0 24px 64px rgba(0,0,0,0.22);text-align:center;position:relative;
            animation:mPop .35s cubic-bezier(.34,1.56,.64,1);border:3px solid;}
          @keyframes mPop{from{opacity:0;transform:scale(0.85) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}
          .st-modal-icon{font-size:3.4rem;margin-bottom:12px;}
          .st-modal-name{font-size:1.35rem;font-weight:900;margin-bottom:4px;}
          .st-modal-desc{font-size:0.84rem;color:#666;line-height:1.55;margin-bottom:14px;}
          .st-modal-prereqs{font-size:0.76rem;color:#777;margin-bottom:14px;padding:10px 12px;
            background:#fafafa;border-radius:12px;text-align:left;display:none;}
          .st-modal-prereqs .prq-title{font-weight:800;margin-bottom:5px;color:#555;}
          .st-modal-cost{display:inline-block;padding:6px 18px;border-radius:13px;font-weight:800;
            font-size:0.88rem;margin-bottom:16px;}
          .st-modal-cost.can-afford{background:#fef3c7;color:#b45309;}
          .st-modal-cost.cannot-afford{background:#fee2e2;color:#dc2626;}
          .st-modal-btn{padding:10px 36px;border-radius:20px;border:none;font-weight:800;font-size:0.92rem;
            cursor:pointer;transition:all .2s;}
          .st-modal-btn.unlock{background:linear-gradient(135deg,#ff6b9d,#ff8fab);color:#fff;
            box-shadow:0 4px 14px rgba(255,107,157,0.35);}
          .st-modal-btn.unlock:hover{transform:scale(1.04);}
          .st-modal-btn.locked-btn{background:#f3f4f6;color:#9ca3af;cursor:not-allowed;}
          .st-modal-close{position:absolute;top:10px;right:14px;width:28px;height:28px;border-radius:50%;
            border:none;background:#f3f4f6;color:#999;font-size:1.05rem;cursor:pointer;
            display:flex;align-items:center;justify-content:center;transition:all .15s;}
          .st-modal-close:hover{background:#e5e7eb;color:#555;}
          @keyframes celePop{from{opacity:0;transform:scale(0.5);}to{opacity:1;transform:scale(1);}}
          @keyframes celeFadeOut{0%{opacity:1;}70%{opacity:1;}100%{opacity:0;}}
          @media(max-width:768px){
            .st-hotspot{width:6vw!important;height:6vw!important;}
            .st-hs-icon{font-size:clamp(14px,3.5vw,22px)!important;}
            .st-hex-hs{width:10vw!important;height:11vw!important;}
            .st-hex-hs-center{width:12vw!important;height:13vw!important;}
          }
        </style>

        <!-- 图片底图 -->
        <img class="st-bg-img" src="/skill-tree-bg.png" alt="技能树" draggable="false" />

        <!-- 交互热区层 -->
        <div class="st-overlay" id="st-overlay">

          <!-- 关闭按钮热区 -->
          <div class="st-close-hs" id="btn-st-close" title="关闭"></div>

          <!-- 上方三个六边形入口卡片热区 -->
          <div class="st-hex-hs st-hex-hs-left" id="hex-eloquence" title="口才维度 · 嘴炮输出营"></div>
          <div class="st-hex-hs st-hex-hs-center" id="hex-center" title="主播 · Lv.${state.level}"></div>
          <div class="st-hex-hs st-hex-hs-right" id="hex-appearance" title="外貌维度 · 颜值buff馆"></div>

          <!-- 技能点计数器热区 -->
          <div class="st-points-hs" title="技能点: ${skillPoints}"></div>

          <!-- ===== 左下：口才维度节点热区（粉红区域）===== -->
          <div class="st-branch" data-dim="eloquence">
            ${eloquenceNodes.map((n,i) => {
              const t=n.tier-1; const tierNodes=eloquenceNodes.filter(x=>x.tier===n.tier); const ri=tierNodes.indexOf(n);
              const xMap=[[8,16,24],[8,17,26],[8,17,26],[12,22]];
              const yBase=[44,56,68,81][t]; const x=(xMap[t]||[10])[Math.min(ri,(xMap[t]||[10]).length-1)]+(i*0.8);
              const y=yBase+(ri>=3?5:0)+(t===3&&ri>=1?3:0);
              const sz = [5.2,5.6,6.2][t]||5.2;
              return makeHotspot(n,x,y,sz);
            }).join('')}
          </div>

          <!-- ===== 中右：知识维度节点热区（蓝紫区域）===== -->
          <div class="st-branch" data-dim="knowledge">
            ${knowledgeNodes.map((n,i) => {
              const t=n.tier-1; const tn=knowledgeNodes.filter(x=>x.tier===n.tier); const ri=tn.indexOf(n);
              const x=47+(tn.length>1?ri*11:11); const y=44+t*13+(ri>=3?5:0);
              const sz=[5.2,5.6,6.2][t]||5.2;
              return makeHotspot(n,x,y,sz);
            }).join('')}
          </div>

          <!-- ===== 右侧：才艺维度节点热区（紫色区域）===== -->
          <div class="st-branch" data-dim="talent">
            ${talentNodes.map((n,i) => {
              const t=n.tier-1; const tn=talentNodes.filter(x=>x.tier===n.tier); const ri=tn.indexOf(n);
              const x=79+(tn.length>1?ri*10:0); const y=46+t*14+(ri>=3?5:0);
              const sz=[5.2,5.6,6.2][t]||5.2;
              return makeHotspot(n,x,y,sz);
            }).join('')}
          </div>

          <!-- ===== 中偏右：外貌维度节点热区（橙粉区域）===== -->
          <div class="st-branch" data-dim="appearance">
            ${appearanceNodes.map((n,i) => {
              const t=n.tier-1; const tn=appearanceNodes.filter(x=>x.tier===n.tier); const ri=tn.indexOf(n);
              const x=63+(tn.length>1?ri*10:0); const y=48+t*13+(ri>=2?5:0);
              const sz=[5.2,5.6,6.2][t]||5.2;
              return makeHotspot(n,x,y,sz);
            }).join('')}
          </div>

          <!-- 底部功能按钮热区 -->
          <div class="st-btn-hs" style="left:73%;bottom:3.8%;width:3.6vh;height:3.6vh;" title="点赞">❤️</div>
          <div class="st-btn-hs" style="left:78.5%;bottom:3.8%;width:3.6vh;height:3.6vh;" title="分享">↗️</div>
          <div class="st-btn-hs" style="left:84%;bottom:3.8%;width:3.6vh;height:3.6vh;" title="水滴">💧</div>
          <div class="st-btn-hs" style="left:89.5%;bottom:3.8%;width:3.6vh;height:3.6vh;" title="定位">📍</div>
          <div class="st-btn-hs" style="left:95%;bottom:3.8%;width:3.6vh;height:3.6vh;" title="设置">⚙️</div>

          <!-- 完成升级按钮热区 -->
          <div class="st-finish-hs" id="btn-st-finish" title="完成升级">完成升级 ✓</div>
        </div>

        <!-- 弹窗 -->
        <div id="st-node-modal" class="hidden">
          <div class="st-modal-card" id="st-modal-card">
            <button class="st-modal-close" id="st-modal-close">×</button>
            <div class="st-modal-icon" id="st-modal-icon"></div>
            <div class="st-modal-name" id="st-modal-name"></div>
            <div class="st-modal-desc" id="st-modal-desc"></div>
            <div class="st-modal-prereqs" id="st-modal-prereqs"></div>
            <div class="st-modal-cost" id="st-modal-cost"></div>
            <button class="st-modal-btn" id="st-modal-action"></button>
          </div>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    const modal = element.querySelector('#st-node-modal') as HTMLElement;
    const modalCard = element.querySelector('#st-modal-card') as HTMLElement;
    const modalIcon = element.querySelector('#st-modal-icon') as HTMLElement;
    const modalName = element.querySelector('#st-modal-name') as HTMLElement;
    const modalDesc = element.querySelector('#st-modal-desc') as HTMLElement;
    const modalPrereqs = element.querySelector('#st-modal-prereqs') as HTMLElement;
    const modalCost = element.querySelector('#st-modal-cost') as HTMLElement;
    const modalAction = element.querySelector('#st-modal-action') as HTMLElement;

    const showUnlockCelebration = (node: SkillNode) => {
      const cele = document.createElement('div');
      cele.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:99999;pointer-events:none;animation:celeFadeOut 1.5s ease forwards;';
      cele.innerHTML = '<div style="text-align:center;animation:celePop .5s cubic-bezier(.34,1.56,.64,1);"><div style="font-size:4rem;">🎉</div><div style="font-size:1.25rem;font-weight:900;color:#e84a7f;margin-top:10px;">解锁成功！</div><div style="font-size:1rem;color:#666;margin-top:6px;">' + node.icon + ' ' + node.name + '</div></div>';
      document.body.appendChild(cele);
      setTimeout(() => cele.remove(), 1500);
    };

    const showModal = (node: SkillNode) => {
      const status = getNodeStatus(node);
      const dim = DIMENSIONS.find(d => d.id === node.dimensionId);
      modalIcon.textContent = node.icon;
      modalName.textContent = node.name;
      modalDesc.textContent = node.description;
      if (node.unlockCondition.requiredNodes.length > 0) {
        const reqNames = node.unlockCondition.requiredNodes.map(id => {
          const rn = SKILL_NODES.find(n => n.id === id);
          const u = unlockedNodes.has(id);
          return '<span style="color:' + (u ? '#4ade80' : '#999') + ';' + (u ? '' : 'text-decoration:line-through;') + 'margin-right:6px;">' + (rn?.icon || '?') + ' ' + (rn?.name || id) + '</span>';
        }).join('');
        modalPrereqs.innerHTML = '<div class="prq-title">📋 前置要求：</div>' + reqNames;
        modalPrereqs.style.display = '';
      } else { modalPrereqs.style.display = 'none'; }
      modalCard.style.borderColor = dim?.color ?? '#ccc';
      const cost = node.unlockCondition.cost ?? 1;
      const canAfford = skillPoints >= cost && status !== 'locked';
      modalCost.textContent = '消耗技能点: ' + cost;
      modalCost.className = 'st-modal-cost ' + (canAfford ? 'can-afford' : 'cannot-afford');
      if (status === 'unlocked') {
        modalAction.textContent = '已解锁 ✓'; modalAction.className = 'st-modal-btn locked-btn';
      } else if (status === 'locked') {
        modalAction.textContent = '🔒 未满足条件'; modalAction.className = 'st-modal-btn locked-btn';
      } else {
        modalAction.textContent = '解锁 (' + cost + '点)'; modalAction.className = 'st-modal-btn unlock';
        modalAction.onclick = () => {
          const c = node.unlockCondition.cost ?? 1;
          if (this.playerData.spendSkillPoints(c)) {
            this.playerData.unlockNode(node.id);
            modal.classList.add('hidden');
            showUnlockCelebration(node);
            this.renderSkillTree();
          } else {
            modalAction.textContent = '❌ 技能点不足！'; modalAction.className = 'st-modal-btn locked-btn';
            setTimeout(() => { modalAction.textContent = '解锁 (' + c + '点)'; modalAction.className = 'st-modal-btn unlock'; }, 1500);
          }
        };
      }
      modal.classList.remove('hidden');
    };

    element.querySelectorAll('.st-hotspot').forEach(el => {
      el.addEventListener('click', () => {
        const nid = (el as HTMLElement).dataset.id;
        const node = SKILL_NODES.find(n => n.id === nid);
        if (node) showModal(node);
      });
    });

    element.querySelector('#st-modal-close')?.addEventListener('click', () => { modal.classList.add('hidden'); });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    element.querySelector('#btn-st-close')?.addEventListener('click', () => { this.stateManager.changeScene('main_hub'); });
    element.querySelector('#btn-st-finish')?.addEventListener('click', () => { this.playerData.finishUpgrade(); this.stateManager.changeScene('main_hub'); });

    element.querySelectorAll('.st-hex-hs').forEach(el => {
      el.addEventListener('click', () => {
        const dimId = el.id.replace('hex-', '');
        const dim = DIMENSIONS.find(d => d.id === dimId);
        if (dim) {
          const firstNode = SKILL_NODES.find(n => n.dimensionId === dimId && n.tier === 1);
          if (firstNode) showModal(firstNode);
        }
      });
    });
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

    // 应用变化
    this.playerData.addFollowers(followerChange);
    this.playerData.addFanClub(fanClubChange);
    this.playerData.addIncome(incomeChange);
    this.playerData.addExp(50 + Math.round(Math.random() * 50));

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
      ">
        <div style="max-width: 600px; width: 100%;">
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

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px;">
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

    element.querySelector('#btn-next-day')?.addEventListener('click', () => {
      this.aiService.clearCache();
      this.playerData.advanceDay();
      
      // 检查游戏是否结束
      if (this.playerData.isGameOver()) {
        this.stateManager.changeScene('game_over');
      } else if (this.playerData.isVictory()) {
        this.stateManager.changeScene('victory');
      } else {
        // 每日结算后，先进入直播计划输入界面
        this.stateManager.changeScene('stream_planning');
      }
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
}
