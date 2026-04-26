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
import { cutsceneSystem, type CutsceneSequence } from '../systems/CutsceneSystem';

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
  
  // 技能树状态保持
  private skillTreeDimensionIndex = 0;

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
    const state = this.playerData.getState();

    const html = `
      <link href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.min.css" rel="stylesheet">
      <style>
        @font-face {
          font-family: 'NotoSerifCJKsc-Regular';
          src: url('https://assets-persist.lovart.ai/agent-static-assets/NotoSerifCJKsc-Regular.otf') format('opentype');
          font-weight: 400;
        }
        @font-face {
          font-family: 'MiSans-Regular';
          src: url('https://assets-persist.lovart.ai/agent-static-assets/MiSans-Regular.ttf') format('truetype');
          font-weight: 400;
        }

        .start-screen-new {
          width: 100vw; height: 100vh;
          background-color: #f7f3e8;
          color: #2c3e50;
          font-family: 'MiSans-Regular', sans-serif;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .start-screen-new .dissolve-fall {
          animation: dissolveFall 1.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
        }
        @keyframes dissolveFall {
          0% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          100% { opacity: 0; transform: translateY(200px) scale(0.95); filter: blur(10px); }
        }

        .start-screen-new .main-container {
          display: flex; width: 100%; height: 100%;
          padding: 40px 60px; gap: 60px; z-index: 1;
          transition: all 0.4s ease;
        }

        .start-screen-new .poster-section {
          flex: 0 0 auto; height: 100%;
          display: flex; align-items: center; justify-content: center;
          animation: ssnFloat 6s ease-in-out infinite;
        }
        @keyframes ssnFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }

        .start-screen-new .poster-image {
          height: 100%; width: auto; max-width: 50vw;
          object-fit: contain;
          box-shadow: 20px 30px 60px rgba(0, 0, 0, 0.08);
          border-radius: 4px;
        }

        .start-screen-new .content-section {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; padding-right: 40px;
        }

        .start-screen-new .title-group { margin-bottom: 80px; }

        .start-screen-new .main-title {
          font-family: 'NotoSerifCJKsc-Regular', serif;
          font-size: clamp(36px, 5.5vw, 84px);
          font-weight: 300; line-height: 1.2; letter-spacing: 4px;
          color: #1a1a1a; margin-bottom: 20px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
        }

        .start-screen-new .sub-title {
          font-family: 'MiSans-Regular', sans-serif;
          font-size: clamp(14px, 1.3vw, 20px);
          font-weight: 300; letter-spacing: 12px;
          color: #7f8c8d; text-transform: uppercase;
        }

        .start-screen-new .menu-list {
          display: flex; flex-direction: column; gap: 30px;
          list-style: none; padding: 0; margin: 0;
        }

        .start-screen-new .menu-item {
          font-family: 'MiSans-Regular', sans-serif;
          font-size: clamp(20px, 2vw, 32px);
          font-weight: 300; letter-spacing: 8px;
          color: #2c3e50; cursor: pointer;
          position: relative; width: fit-content;
          padding: 10px 0; transition: color 0.3s ease;
          display: flex; align-items: center;
        }
        .start-screen-new .menu-item::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 1px; background-color: #2c3e50;
          transition: width 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .start-screen-new .menu-item:hover { color: #000; }
        .start-screen-new .menu-item:hover::after { width: 100%; }
        .start-screen-new .menu-item i {
          font-size: 24px; margin-right: 15px;
          opacity: 0; transform: translateX(-10px);
          transition: all 0.3s ease;
        }
        .start-screen-new .menu-item:hover i {
          opacity: 1; transform: translateX(0);
        }

        .start-screen-new .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(247, 243, 232, 0.85);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; opacity: 0; pointer-events: none;
          transition: opacity 0.4s ease;
        }
        .start-screen-new .modal-overlay.active {
          opacity: 1; pointer-events: auto;
        }

        .start-screen-new .modal-content {
          background: #fffdf8; padding: 60px 80px; border-radius: 2px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.05);
          width: 600px; max-width: 90vw;
          transform: translateY(30px); opacity: 0;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative; border: 1px solid rgba(0,0,0,0.05);
        }
        .start-screen-new .modal-overlay.active .modal-content {
          transform: translateY(0); opacity: 1;
        }

        .start-screen-new .modal-close {
          position: absolute; top: 30px; right: 30px;
          font-size: 28px; color: #7f8c8d; cursor: pointer;
          transition: color 0.3s;
        }
        .start-screen-new .modal-close:hover { color: #2c3e50; }

        .start-screen-new .modal-title {
          font-family: 'NotoSerifCJKsc-Regular', serif;
          font-size: 36px; margin-bottom: 40px;
          font-weight: 300; letter-spacing: 4px;
        }

        .start-screen-new .form-group { margin-bottom: 30px; }
        .start-screen-new .form-group label {
          display: block; font-size: 14px; letter-spacing: 2px;
          margin-bottom: 10px; color: #7f8c8d; text-transform: uppercase;
        }
        .start-screen-new .form-group input {
          width: 100%; padding: 15px 0;
          background: transparent; border: none;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          font-family: 'MiSans-Regular', sans-serif;
          font-size: 16px; color: #2c3e50; outline: none;
          transition: border-color 0.3s;
        }
        .start-screen-new .form-group input:focus {
          border-bottom-color: #2c3e50;
        }

        .start-screen-new .about-text {
          font-size: 16px; line-height: 2; color: #555;
          letter-spacing: 1px; text-align: justify;
        }
        .start-screen-new .about-text p { margin-bottom: 20px; }

        .start-screen-new .save-btn {
          width: 100%; padding: 12px;
          background: #2c3e50; border: none; border-radius: 2px;
          color: #fff; font-family: 'MiSans-Regular', sans-serif;
          font-size: 16px; letter-spacing: 4px;
          cursor: pointer; transition: background 0.3s;
        }
        .start-screen-new .save-btn:hover { background: #1a252f; }
        .start-screen-new .save-status {
          text-align: center; font-size: 13px; color: #7f8c8d;
          margin-top: 12px; opacity: 0; transition: opacity 0.3s;
        }
        .start-screen-new .save-status.show { opacity: 1; }
      </style>

      <div class="start-screen-new">
        <div class="main-container" id="mainContainer">
          <div class="poster-section">
            <img src="海报2.png" alt="游戏海报" class="poster-image">
          </div>

          <div class="content-section">
            <div class="title-group">
              <h1 class="main-title">主播模拟器·双面人生</h1>
              <div class="sub-title">Streamer Simulator</div>
            </div>
            <ul class="menu-list">
              <li class="menu-item" id="menu-start"><i class="ri-play-line"></i>开始游戏</li>
              <li class="menu-item" id="menu-settings"><i class="ri-settings-3-line"></i>设置</li>
              <li class="menu-item" id="menu-about"><i class="ri-information-line"></i>关于我们</li>
            </ul>
          </div>
        </div>

        <!-- 设置弹窗 -->
        <div class="modal-overlay" id="settingsModal">
          <div class="modal-content">
            <i class="ri-close-line modal-close" id="close-settings"></i>
            <h2 class="modal-title">系统配置</h2>
            <div class="form-group">
              <label>API Key（Google AI Studio）</label>
              <input type="password" id="api-key-input" placeholder="不配置则使用默认预设内容" value="${state.apiKey}">
            </div>
            <button class="save-btn" id="btn-save-key">保存配置</button>
            <div class="save-status" id="save-status">已保存</div>
          </div>
        </div>

        <!-- 关于我们弹窗 -->
        <div class="modal-overlay" id="aboutModal">
          <div class="modal-content">
            <i class="ri-close-line modal-close" id="close-about"></i>
            <h2 class="modal-title">关于我们</h2>
            <div class="about-text">
              <p>《主播模拟器·双面人生》致力于探索虚拟与现实的边界。在光鲜亮丽的镜头前与繁杂琐碎的幕后生活中，体验截然不同的人生轨迹。</p>
              <p>本作采用极简的设计语言，结合水彩墨染的艺术风格，试图传达一种清冷而梦幻的故事氛围。感谢您参与这段独特的数字旅程。</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    this.uiContainer.appendChild(element);
    this.currentUIElement = element;

    // 点击音效
    let audioCtx: AudioContext | null = null;
    const playClickSound = () => {
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    };
    element.querySelectorAll('.menu-item, .modal-close').forEach(item => {
      item.addEventListener('mousedown', playClickSound);
    });

    // 开始游戏：溶解坠落转场 → 过场动画 → 分区选择
    element.querySelector('#menu-start')?.addEventListener('click', async () => {
      const container = element.querySelector('#mainContainer') as HTMLElement;
      if (container) {
        container.classList.add('dissolve-fall');
        await new Promise<void>(resolve => setTimeout(resolve, 1500));
      }
      await this.showOpeningScene();
      this.playerData.reset();
      this.stateManager.changeScene('category_select');
    });

    // 设置弹窗
    const settingsModal = element.querySelector('#settingsModal') as HTMLElement;
    element.querySelector('#menu-settings')?.addEventListener('click', () => {
      settingsModal?.classList.add('active');
    });
    element.querySelector('#close-settings')?.addEventListener('click', () => {
      settingsModal?.classList.remove('active');
    });
    settingsModal?.addEventListener('click', (e) => {
      if (e.target === settingsModal) settingsModal.classList.remove('active');
    });

    // 保存 API Key
    element.querySelector('#btn-save-key')?.addEventListener('click', () => {
      const input = element.querySelector('#api-key-input') as HTMLInputElement;
      this.playerData.setApiKey(input.value);
      this.aiService.setApiKey(input.value);
      const status = element.querySelector('#save-status');
      status?.classList.add('show');
      setTimeout(() => status?.classList.remove('show'), 2000);
    });

    // 关于弹窗
    const aboutModal = element.querySelector('#aboutModal') as HTMLElement;
    element.querySelector('#menu-about')?.addEventListener('click', () => {
      aboutModal?.classList.add('active');
    });
    element.querySelector('#close-about')?.addEventListener('click', () => {
      aboutModal?.classList.remove('active');
    });
    aboutModal?.addEventListener('click', (e) => {
      if (e.target === aboutModal) aboutModal.classList.remove('active');
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
    // 使用类成员变量保持当前维度，避免重新渲染时跳回口才
    let currentDimensionIndex = this.skillTreeDimensionIndex;

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
        // 已解锁：彩色渐变，白色边框，有阴影
        btnStyle = `width:80px;height:80px;border-radius:50%;border:5px solid #fff;transition:all .3s;background:linear-gradient(135deg,${gf},${gt});box-shadow:0 8px 25px ${gf}50,color:#fff;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;flex-shrink:0;`;
        badgeBg = '#fbbf24';
        labelBg = 'rgba(255,255,255,0.95)';
        labelColor = '#db2777';
        labelBorder = '#fce7f3';
        iconOpacity = '1';
        overlayHtml = '';
      } else if (status === 'available') {
        // 可解锁（前置满足但未学习）：灰色背景，彩色边框，无渐变填充
        btnStyle = `width:80px;height:80px;border-radius:50%;border:5px solid ${gf};transition:all .3s;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);box-shadow:0 4px 12px rgba(0,0,0,0.1);color:${gf};display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;flex-shrink:0;`;
        badgeBg = '#ec4899';
        labelBg = 'rgba(255,255,255,0.95)';
        labelColor = '#db2777';
        labelBorder = '#fce7f3';
        iconOpacity = '0.7';
        overlayHtml = '';
      } else {
        // 未解锁（前置不满足）：灰色，有锁图标
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
          // 保存当前维度到类成员变量
          this.skillTreeDimensionIndex = index;
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
            // 保存当前维度后再重新渲染，避免跳回口才维度
            this.skillTreeDimensionIndex = currentDimensionIndex;
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
    
    // 直播间UI - 透明PNG分层架构 (measure-png.mjs 精确测量)
    const html = `
      <div style="
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a2e;
        font-family: 'Noto Sans SC', sans-serif;
        color: white;
      ">
      <div class="livestream" style="
        position: relative;
        width: min(100vw, calc(100vh * 1672 / 941));
        aspect-ratio: 1672 / 941;
        overflow: hidden;
      ">

        <!-- ===== 底层 z:1 - 三个内容div，透过透明PNG镂空洞显示 ===== -->

        <!-- 公告栏 (像素测量: top:48 left:273 915x73) -->
        <div id="title-bar" style="
          position: absolute;
          top: 5.10%;
          left: 16.33%;
          width: 54.73%;
          height: 7.76%;
          z-index: 1;
          padding: 1.5%;
          box-sizing: border-box;
          overflow: hidden;
        ">
          <div style="font-size: 0.85rem; font-weight: 700; color: #5b7ea8; margin-bottom: 10px;">📢 公告栏</div>
          <div style="font-size: 0.75rem; color: #6b8aab; line-height: 1.7;">
            欢迎来到直播间！请遵守直播规则，文明互动～<br>
            <span style="color: #e87ba8;">💖 ${state.category === 'music' ? '音乐' : state.category === 'dance' ? '舞蹈' : state.category === 'gaming' ? '游戏' : '综艺'}直播中</span>
          </div>
        </div>

        <!-- 左侧直播画面 (像素测量: top:163 left:33 1256x701) -->
        <div id="live-area" style="
          position: absolute;
          top: 17.32%;
          left: 1.97%;
          width: 75.12%;
          height: 74.49%;
          overflow: hidden;
          z-index: 1;
          background: #000;
        ">
          <img src="电脑桌面背景.png" style="width: 100%; height: 100%; object-fit: cover; display: block;">

          <!-- 顶部信息条（悬浮在直播画面内顶部） -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 5;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              background: rgba(255,255,255,0.15);
              backdrop-filter: blur(8px);
              padding: 4px 12px 4px 4px;
              border-radius: 50px;
            ">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #fe2c55, #25f4ee); border-radius: 50%;"></div>
              <div>
                <div style="font-size: 0.75rem; font-weight: 700;">PixelQueen</div>
                <div style="font-size: 0.65rem; opacity: 0.8;">${PlayerData.formatNumber(state.followers)} 粉丝</div>
              </div>
            </div>
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              background: rgba(255,255,255,0.15);
              backdrop-filter: blur(8px);
              padding: 6px 14px;
              border-radius: 50px;
            ">
              <div style="width: 8px; height: 8px; background: #ff0000; border-radius: 50%; animation: pulse 1s infinite;"></div>
              <span style="font-size: 0.8rem; font-weight: 700;">${PlayerData.formatNumber(PlayerData.getViewerCount(state.followers, state.stageId))} 人在看</span>
            </div>
          </div>

          <!-- 弹幕容器（在直播画面内滚动） -->
          <div id="danmaku-container" style="
            position: absolute;
            top: 10%;
            left: 0;
            width: 100%;
            height: 50%;
            overflow: hidden;
            pointer-events: none;
          "></div>

          <!-- 主播皮套（左下角） -->
          <div id="vtuber-container" style="
            position: absolute;
            bottom: 0;
            left: 5%;
            width: 30%;
            z-index: 15;
            pointer-events: none;
          ">
            <img id="vtuber-sprite" src="vtuber/睁眼.png" style="width: 100%; height: auto; display: block;">
          </div>
        </div>

        <!-- 右侧评论区 (像素测量: top:172 left:1304 326x652) -->
        <div id="chat-area" style="
          position: absolute;
          top: 18.28%;
          left: 77.99%;
          width: 19.50%;
          height: 69.29%;
          z-index: 1;
          overflow: hidden;
          padding: 10px;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
        ">
          <div style="font-size: 0.75rem; color: #5DADE2; margin-bottom: 8px; font-weight: 700;">💬 直播评论</div>
          <div id="comments-container" style="display: flex; flex-direction: column; gap: 8px; height: calc(100% - 24px); overflow-y: auto;"></div>
        </div>

        <!-- ===== 交互层 z:20 ===== -->
        <button id="btn-end-stream" style="
          position: absolute;
          bottom: 2%;
          right: 3%;
          padding: 8px 20px;
          background: #fe2c55;
          border: none;
          border-radius: 50px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.85rem;
          z-index: 20;
        ">结束直播</button>

        <!-- 事件弹窗容器 -->
        <div id="event-popup" style="display: none;"></div>

        <!-- ===== 顶层 z:10 - 透明PNG覆盖层 ===== -->
        <div style="
          position: absolute;
          inset: 0;
          background: url('直播间UI挖空真.png') 0 0 / 100% 100% no-repeat;
          pointer-events: none;
          z-index: 10;
        "></div>

      </div>
      </div>

      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes danmaku-scroll {
          from { transform: translateX(100%); }
          to { transform: translateX(-100vw); }
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
        top: ${Math.random() * 90}%;
        right: 0;
        transform: translateX(100%);
        animation: danmaku-scroll ${duration}s linear forwards;
      `;
      danmakuContainer.appendChild(danmaku);
      setTimeout(() => danmaku.remove(), (duration + 2) * 1000);
    };

    // 添加评论
    const avatarColors = [
      'linear-gradient(135deg, #FFB6C1, #FFC0CB)',
      'linear-gradient(135deg, #87CEFA, #B0E0E6)',
      'linear-gradient(135deg, #98FB98, #90EE90)',
      'linear-gradient(135deg, #DDA0DD, #E6E6FA)',
      'linear-gradient(135deg, #FFD700, #FFA500)',
    ];
    const addComment = () => {
      const comment = getRandomComment();
      const avatarBg = avatarColors[Math.floor(Math.random() * avatarColors.length)];
      const initial = comment.user.charAt(0);
      const el = document.createElement('div');
      el.style.cssText = 'display: flex; align-items: flex-start; gap: 6px;';
      el.innerHTML = `
        <div style="
          width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: #fff; font-weight: 700;
          background: ${avatarBg};
        ">${initial}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 11px; font-weight: 700; color: #5DADE2; margin-bottom: 2px;">${comment.user}</div>
          <div style="font-size: 11px; color: #444; line-height: 1.4; word-wrap: break-word;">${comment.text}</div>
        </div>
      `;
      commentsContainer.appendChild(el);
      if (commentsContainer.children.length > 15) {
        commentsContainer.firstChild?.remove();
      }
    };

    // 显示事件弹窗
    const showEvent = (event: any) => {
      const impact = this.eventPool.calculateEventImpact(event, state);

      // 根据事件类型切换主播表情
      if (event.type === 'big_spender') setExpression('happy', 3000);
      else if (event.type === 'pk_battle') setExpression('focus', 0);

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
              cleanup();
              this.stateManager.changeScene('daily_summary');
            }, 2000);
          }
        }
      });
    };

    // 主播皮套表情系统
    const vtuberSprite = element.querySelector('#vtuber-sprite') as HTMLImageElement;
    const expressions = {
      normal: 'vtuber/睁眼.png',
      blink: 'vtuber/闭眼.png',
      happy: 'vtuber/开心.png',
      shy: 'vtuber/害羞.png',
      focus: 'vtuber/认真.png',
    } as const;
    let currentExpression = 'normal';
    let expressionTimer: number | null = null;

    const setExpression = (name: keyof typeof expressions, durationMs: number = 0) => {
      if (name === currentExpression) return;
      currentExpression = name;
      vtuberSprite.src = expressions[name];
      if (expressionTimer !== null) clearTimeout(expressionTimer);
      if (durationMs > 0) {
        expressionTimer = window.setTimeout(() => {
          currentExpression = 'normal';
          vtuberSprite.src = expressions.normal;
          expressionTimer = null;
        }, durationMs);
      }
    };

    // 眨眼定时器
    const blink = () => {
      if (currentExpression === 'normal') {
        setExpression('blink');
        setTimeout(() => {
          if (currentExpression === 'blink') setExpression('normal');
        }, 150);
      }
    };
    const blinkInterval = window.setInterval(blink, 3500 + Math.random() * 2000);

    const cleanup = () => {
      clearInterval(danmakuInterval);
      clearInterval(commentInterval);
      clearInterval(blinkInterval);
      if (expressionTimer !== null) clearTimeout(expressionTimer);
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
        cleanup();
        this.stateManager.changeScene('daily_summary');
      }, 5000);
    }

    // 手动结束直播按钮（可以提前结束）
    element.querySelector('#btn-end-stream')?.addEventListener('click', () => {
      cleanup();
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
   * 统一的对话/事件渲染方法
   * 所有剧情、NPC、随机事件共用一个视觉风格
   */
  private async renderUnifiedDialog(config: {
    speaker?: string;
    text: string;
    emotion?: string;
    choices?: any[];
    npcId?: string;
    npcEmoji?: string;
    npcName?: string;
    onChoiceSelect?: (choice: any) => void;
    showContinue?: boolean;
  }): Promise<string | null> {
    return new Promise((resolve) => {
      const state = this.playerData.getState();
      const isDaytime = !state.hasFinishedUpgrade;
      const bgUrl = isDaytime ? this.dayBgUrl : this.nightBgUrl;

      const npcEmojiMap: Record<string, string> = {
        landlady: '👵', kexin: '👩', mom: '👩‍🦳',
        doudou: '🐕', yueya: '👸', harasser: '👨',
      };
      const emotionMap: Record<string, string> = {
        positive: 'happy', happy: 'smile', nervous: 'nervous',
        scared: 'scared', angry: 'angry', disgusted: 'disgusted',
        embarrassed: 'embarrassed', panicked: 'panicked',
        playful: 'playful', tired: 'smile', sad: 'scared',
        confident: 'happy', default: 'smile', smile: 'smile',
      };
      const expression = emotionMap[config.emotion || 'default'] || 'smile';

      const npcEmoji = config.npcEmoji || (config.npcId ? npcEmojiMap[config.npcId] : null);

      const choicesHtml = config.choices?.length
        ? `<div class="dialog-choices">
            ${config.choices.map((c: any, i: number) => `
              <button class="choice-btn" data-choice-id="${c.id}">
                <span class="choice-index">${i + 1}</span>${c.text}
              </button>`).join('')}
           </div>`
        : '';

      const continueHtml = config.showContinue !== false && !config.choices?.length
        ? `<div style="display:flex;justify-content:flex-end;margin-top:16px;">
             <button class="dialog-continue-btn" id="btn-dialog-continue">继续 ▸</button>
           </div>`
        : '';

      const html = `
        <div class="dialog-scene" style="background-image:url('${bgUrl}');background-size:cover;background-position:center;">
          <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45);"></div>

          ${npcEmoji ? `
          <div class="npc-portrait emoji-fallback">${npcEmoji}</div>
          ` : ''}

          <div class="character-portrait right animate-breathe">
            <img src="./portraits/${expression}.png" alt="小爱"
                 onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'font-size:100px;text-align:center;line-height:350px;\\'>👩</div>';">
          </div>

          <div class="dialog-box">
            ${config.speaker ? `<div class="dialog-speaker">${config.speaker}</div>` : ''}
            <div class="dialog-text">${config.text}</div>
            ${choicesHtml}
            ${continueHtml}
          </div>
        </div>
      `;

      this.showOverlay(html);

      if (config.choices?.length) {
        const overlay = document.getElementById('double-life-overlay');
        const btns = overlay?.querySelectorAll('.choice-btn');
        btns?.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const choiceId = (e.currentTarget as HTMLElement).dataset.choiceId;
            const choice = config.choices!.find((c: any) => c.id === choiceId);
            if (choice) {
              if (config.onChoiceSelect) config.onChoiceSelect(choice);
              this.hideOverlay();
              resolve(choice.id || choiceId || null);
            }
          });
        });
      } else {
        document.getElementById('btn-dialog-continue')?.addEventListener('click', () => {
          this.hideOverlay();
          resolve(null);
        });
      }
    });
  }

  /**
   * 显示NPC对话 — 走统一渲染
   */
  private async showNPCDialog(interaction: any): Promise<void> {
    if (interaction.choices && interaction.choices.length > 0) {
      await this.renderUnifiedDialog({
        speaker: interaction.npcName,
        text: interaction.dialog,
        emotion: interaction.emotion,
        npcId: interaction.npcId,
        choices: interaction.choices,
        onChoiceSelect: (choice) => {
          this.npcSystem.applyChoiceEffects(choice, interaction.npcId);
        },
      });
    } else {
      await this.renderUnifiedDialog({
        speaker: interaction.npcName,
        text: interaction.dialog,
        emotion: interaction.emotion,
        npcId: interaction.npcId,
      });
    }
  }

  /**
   * 显示剧情节点 — 走统一渲染
   */
  private async showStoryNode(node: any): Promise<void> {
    await this.renderUnifiedDialog({
      text: node.dialog || node.sceneDescription || '',
      emotion: node.emotion,
      choices: node.choices,
      onChoiceSelect: (choice) => {
        if (choice.effects.followers) this.playerData.addFollowers(choice.effects.followers);
        if (choice.effects.kindness) this.playerData.addKindness(choice.effects.kindness);
        if (choice.effects.integrity) this.playerData.addIntegrity(choice.effects.integrity);
        if (choice.effects.sanity) this.playerData.addSanity(choice.effects.sanity);
        if (choice.effects.money) this.playerData.addIncome(choice.effects.money);
        if (choice.effects.npcRelation) {
          this.playerData.addNPCRelation(choice.effects.npcRelation.npcId as any, choice.effects.npcRelation.change);
        }
        if (choice.effects.personaIntegrity) this.playerData.addPersonaIntegrity(choice.effects.personaIntegrity);

        this.playerData.recordStoryChoice(node.id, choice.id);
        gameLogger.logStoryChoice(node, choice);

        if (node.isMajor && Math.random() < 0.7) {
          const hotSearch = this.hotSearchSystem.generateFromStoryNode(node);
          if (hotSearch) {
            gameLogger.logHotSearch(hotSearch);
            setTimeout(() => this.renderHotSearch(hotSearch, () => {}), 300);
          }
        }
      },
    });
  }

  /**
   * 显示随机事件 — 走统一渲染
   */
  private async showRandomEvent(event: any): Promise<void> {
    await this.renderUnifiedDialog({
      text: event.dialog || event.description || '',
      emotion: event.emotion,
      choices: event.choices,
      onChoiceSelect: (choice) => {
        if (choice.effects.followers) this.playerData.addFollowers(choice.effects.followers);
        if (choice.effects.kindness) this.playerData.addKindness(choice.effects.kindness);
        if (choice.effects.integrity) this.playerData.addIntegrity(choice.effects.integrity);
        if (choice.effects.sanity) this.playerData.addSanity(choice.effects.sanity);
        if (choice.effects.money) this.playerData.addIncome(choice.effects.money);
        if (choice.effects.failCount) this.playerData.incrementFailCount();
        if (choice.effects.personaIntegrity) this.playerData.addPersonaIntegrity(choice.effects.personaIntegrity);

        gameLogger.logRandomEventChoice(event, choice);

        if (choice.hotSearchChance && Math.random() < choice.hotSearchChance) {
          const hotSearch = this.hotSearchSystem.generate(event.id);
          if (hotSearch) {
            gameLogger.logHotSearch(hotSearch);
            setTimeout(() => this.renderHotSearch(hotSearch, () => {}), 300);
          }
        }
      },
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
   * 显示开场动画（漫画过场）- 穿越剧情
   * 使用CutsceneSystem播放商业级过场动画
   */
  private async showOpeningScene(): Promise<void> {
    // 定义开场漫画序列
    const openingSequence: CutsceneSequence = [
      // 第1张漫画：深夜的执念
      {
        type: 'image',
        src: 'comic/漫画1.png',
        duration: 4000,
        transition: { in: 'fade', out: 'fade', duration: 800 },
        effect: 'ken-burns',
      },
      // 文字幕卡1
      {
        type: 'text',
        content: '你是一名普通的大学生',
        subContent: '也是主播"小爱"的忠实粉丝',
        duration: 3000,
        typingEffect: true,
        typingSpeed: 80,
        transition: { in: 'fade', out: 'fade', duration: 600 },
      },
      // 第2张漫画：消失的偶像
      {
        type: 'image',
        src: 'comic/漫画2.png',
        duration: 4000,
        transition: { in: 'slide-up', out: 'slide-up', duration: 800 },
        effect: 'none',
      },
      // 文字幕卡2
      {
        type: 'text',
        content: '100天前，小爱突然断更停播',
        subContent: '有人说她被封杀了，有人说她退网了\n但你知道——她不会无缘无故消失',
        duration: 4000,
        typingEffect: true,
        typingSpeed: 70,
        transition: { in: 'fade', out: 'fade', duration: 600 },
      },
      // 第3张漫画：诡异的推送
      {
        type: 'image',
        src: 'comic/漫画3.png',
        duration: 4000,
        transition: { in: 'scale', out: 'scale', duration: 1000 },
        effect: 'pulse',
      },
      // 文字幕卡3
      {
        type: 'text',
        content: '今天凌晨两点',
        subContent: '你收到了一条推送——\n"小爱的直播间重新开播了"',
        duration: 3500,
        typingEffect: true,
        typingSpeed: 90,
        transition: { in: 'fade', out: 'fade', duration: 600 },
      },
      // 第4张漫画：穿越瞬间
      {
        type: 'image',
        src: 'comic/漫画4.png',
        duration: 4000,
        transition: { in: 'fade', out: 'fade', duration: 1200 },
        effect: 'none',
      },
      // 系统提示
      {
        type: 'text',
        content: '【检测到强烈执念——穿越程序启动】',
        subContent: '绑定角色：林小爱（未出道版）\n时间线：直播第1天',
        duration: 4000,
        typingEffect: true,
        typingSpeed: 60,
        transition: { in: 'fade', out: 'fade', duration: 800 },
      },
      // 第5张漫画：新的开始
      {
        type: 'image',
        src: 'comic/漫画5.png',
        duration: 4500,
        transition: { in: 'scale', out: 'fade', duration: 1000 },
        effect: 'ken-burns',
      },
      // 最终文字幕卡
      {
        type: 'text',
        content: '你睁开眼睛',
        subContent: '一间不到10平米的出租屋\n电脑屏幕上闪着光——\n"欢迎回来，小爱♡"',
        duration: 5000,
        typingEffect: true,
        typingSpeed: 70,
        transition: { in: 'fade', out: 'fade', duration: 1000 },
      },
      // 任务提示
      {
        type: 'text',
        content: '任务：走完她的人生之路',
        subContent: '目标：找到她停播100天的真相',
        duration: 0, // 等待点击
        typingEffect: true,
        typingSpeed: 80,
        transition: { in: 'fade', out: 'fade', duration: 600 },
      },
    ];

    // 使用CutsceneSystem播放过场动画
    await cutsceneSystem.play({
      sequence: openingSequence,
      backgroundColor: '#000000',
      allowSkip: true,
      autoAdvance: true,
    });
  }

  // ==================== 电脑桌面APP系统 ====================

  private openApps: Set<string> = new Set();

  // ==================== 电脑桌面系统（二次元Windows风格） ====================

  private renderComputerDesktop(): void {
    const state = this.playerData.getState();
    const survival = state.survival || { rentDue: 0, utilitiesDue: 0 };
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`;

    // Game NPC data
    const npcList: { id: string; name: string; color: string; msgs: string[]; lastMsg: string }[] = [
      { id: 'landlady', name: '房东太太', color: '#B8860B', msgs: ['房租记得交哦', '年轻人要努力啊', '要按时交租'], lastMsg: survival.rentDue > 0 ? `已拖欠${survival.rentDue}天房租` : '房租记得交哦' },
      { id: 'kexin', name: '可心', color: '#FF69B4', msgs: ['嗨！最近直播怎么样？', '一起加油！', '我也要开播啦', '明天一起吃饭？'], lastMsg: '在吗？' },
      { id: 'mom', name: '妈妈', color: '#9370DB', msgs: ['照顾好自己', '妈妈想你', '注意身体', '有空回家看看'], lastMsg: '注意身体' },
      { id: 'yueya', name: '月牙儿', color: '#4169E1', msgs: ['加油吧，新人~', '这个行业没那么简单', '有机会可以合作', '你的直播我看了，还行'], lastMsg: '加油吧，新人~' },
    ];
    if (state.npcRelations?.doudou > 0) {
      npcList.splice(3, 0, { id: 'doudou', name: '豆豆', color: '#DEB887', msgs: ['汪汪！', '（摇尾巴）', '（蹭蹭）', '（舔手）'], lastMsg: '汪汪！' });
    }

    // Game Weibo posts
    const weiboPosts = [
      { id: 1, author: '月牙儿', color: '#4169E1', time: '10分钟前', content: '今天直播突破了10万在线！感谢大家支持❤️ 新人们也要加油哦～ #月牙儿日常#', likes: 2847, shares: 356, comments: [{ name: '小爱', content: '恭喜月牙儿姐！太厉害了！' }, { name: '甜甜圈', content: '永远支持月牙儿！' }] },
      { id: 2, author: '可心', color: '#FF69B4', time: '半小时前', content: '今天的直播翻车了哈哈😂 但粉丝说翻车更有意思？新人主播的日常就是这样吧～ #新人主播#', likes: 156, shares: 23, comments: [{ name: '小爱', content: '可心加油！翻车也是一种节目效果' }, { name: '追星少女', content: '可心太可爱了！关注了！' }] },
      { id: 3, author: '铁粉阿伟', color: '#E67E22', time: '1小时前', content: '有没有人觉得小爱最近越来越好了？从第一天直播就开始关注，肉眼可见的进步💪 #小爱加油#', likes: 89, shares: 12, comments: [{ name: '甜橙味', content: '同感！我也是第一批粉丝' }, { name: '月牙儿', content: '嗯，新人里有潜力的～' }] },
      { id: 4, author: '吃瓜群众小王', color: '#27AE60', time: '2小时前', content: '听说最近有个主播住出租屋直播火了，也太真实了吧，感觉在看自己 #主播出租屋#', likes: 234, shares: 56, comments: [{ name: '打工人小李', content: '这就是我们的生活啊' }, { name: '夜猫子', content: '蹲一个ID，想去看看' }] },
      { id: 5, author: '甜橙味', color: '#F39C12', time: '3小时前', content: '小爱的弹幕氛围真的好好，不像有些直播间那么乌烟瘴气，这才是我想要的直播间🌸', likes: 67, shares: 8, comments: [{ name: '铁粉阿伟', content: '老粉认证！从一开始就这样' }, { name: '可心', content: '嘿嘿，我也有去看哦～' }] },
    ];

    const hotSearches = this.hotSearchSystem.getCurrentHotSearches(10);
    const npcKeys = npcList.map(n => n.id);

    const html = `
      <link href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.min.css" rel="stylesheet">
      <style>
        .dsim{width:100vw;height:100vh;overflow:hidden;position:relative;font-family:'Noto Sans SC',-apple-system,BlinkMacSystemFont,sans-serif;user-select:none;background:url('电脑桌面背景.png') center/cover no-repeat}
        .dsim .dsk{position:absolute;top:0;left:0;width:100%;height:calc(100% - 50px);padding:20px;display:flex;flex-direction:column;gap:20px;align-items:flex-start}
        .dsim .dsk-icon{width:80px;height:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;border-radius:8px;transition:all .3s;padding:10px}
        .dsim .dsk-icon:hover{background:rgba(255,255,255,.2);backdrop-filter:blur(5px)}
        .dsim .dsk-icon i{font-size:48px;text-shadow:0 2px 4px rgba(0,0,0,.3)}
        .dsim .dsk-icon.wc i{color:#07C160} .dsim .dsk-icon.wb i{color:#E6162D}
        .dsim .dsk-icon span{color:#fff;font-size:14px;text-shadow:0 1px 2px rgba(0,0,0,.8);text-align:center}
        .dsim .tbar{position:absolute;bottom:0;left:0;width:100%;height:50px;background:rgba(255,255,255,.6);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,.4);display:flex;justify-content:space-between;align-items:center;padding:0 20px;z-index:9999}
        .dsim .tbar-c{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:15px;height:100%}
        .dsim .tbar-icon{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;transition:all .3s;position:relative}
        .dsim .tbar-icon:hover{background:rgba(255,255,255,.5)}
        .dsim .tbar-icon.active::after{content:'';position:absolute;bottom:2px;width:20px;height:3px;background:#4A90E2;border-radius:2px}
        .dsim .tbar-icon.wc i{color:#07C160} .dsim .tbar-icon.wb i{color:#E6162D}
        .dsim .sys-tray{display:flex;align-items:center;gap:15px;font-size:14px;color:#333}
        .dsim .time-date{display:flex;flex-direction:column;align-items:end;line-height:1.2}
        .dsim .close-ds{margin-left:15px;padding:4px 10px;background:rgba(255,0,0,.15);border:1px solid rgba(255,0,0,.3);border-radius:4px;color:#c00;cursor:pointer;font-size:12px;transition:all .2s}
        .dsim .close-ds:hover{background:rgba(255,0,0,.3)}

        .dsim .win{position:absolute;background:rgba(255,255,255,.6);backdrop-filter:blur(15px);border:1px solid rgba(255,255,255,.4);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.1);display:none;flex-direction:column;overflow:hidden;z-index:1000}
        .dsim .tbar-win{height:40px;background:rgba(255,255,255,.3);display:flex;justify-content:space-between;align-items:center;padding:0 15px;cursor:move;border-bottom:1px solid rgba(255,255,255,.4)}
        .dsim .tbar-info{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;color:#333}
        .dsim .win-ctrls{display:flex;gap:10px}
        .dsim .ctrl-btn{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;transition:all .3s;color:#333}
        .dsim .ctrl-btn:hover{background:rgba(0,0,0,.1)}
        .dsim .ctrl-btn.close:hover{background:#ff4757;color:#fff}

        /* WeChat */
        .dsim #wc-win{width:900px;height:600px;top:80px;left:100px}
        .dsim .wc-body{display:flex;height:calc(100% - 40px)}
        .dsim .wc-side{width:60px;background:rgba(0,0,0,.05);display:flex;flex-direction:column;align-items:center;padding:20px 0;gap:20px;border-right:1px solid rgba(255,255,255,.4)}
        .dsim .wc-side i{font-size:24px;color:#888;cursor:pointer;transition:all .3s}
        .dsim .wc-side i:hover,.dsim .wc-side i.active{color:#07C160}
        .dsim .wc-list{width:280px;background:rgba(255,255,255,.4);border-right:1px solid rgba(255,255,255,.4);display:flex;flex-direction:column}
        .dsim .wc-search{padding:15px;border-bottom:1px solid rgba(255,255,255,.4)}
        .dsim .wc-search input{width:100%;padding:8px 12px;border:none;background:rgba(255,255,255,.5);border-radius:20px;font-size:12px;outline:none}
        .dsim .wc-contacts{flex:1;overflow-y:auto}
        .dsim .wc-ct{display:flex;padding:15px;gap:10px;cursor:pointer;transition:all .3s}
        .dsim .wc-ct:hover,.dsim .wc-ct.active{background:rgba(255,255,255,.6)}
        .dsim .wc-avatar{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:16px;flex-shrink:0}
        .dsim .wc-ct-info{flex:1;display:flex;flex-direction:column;justify-content:center;gap:4px;min-width:0}
        .dsim .wc-ct-name{font-size:14px;color:#333;font-weight:500}
        .dsim .wc-ct-msg{font-size:12px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .dsim .wc-chat{flex:1;display:flex;flex-direction:column;background:rgba(245,245,245,.5)}
        .dsim .wc-chat-hdr{height:60px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.4)}
        .dsim .wc-chat-hdr .hdr-name{font-size:18px;font-weight:bold;color:#333}
        .dsim .wc-msgs{flex:1;padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:15px}
        .dsim .msg{display:flex;gap:10px;max-width:80%}
        .dsim .msg.npc{align-self:flex-start} .dsim .msg.player{align-self:flex-end;flex-direction:row-reverse}
        .dsim .msg-bubble{padding:10px 15px;border-radius:12px;font-size:14px;line-height:1.5}
        .dsim .msg.npc .msg-bubble{background:#fff;color:#333;border-top-left-radius:0}
        .dsim .msg.player .msg-bubble{background:linear-gradient(135deg,#4A90E2,#6AB0F3);color:#fff;border-top-right-radius:0}
        .dsim .wc-input-area{border-top:1px solid rgba(255,255,255,.4);display:flex;flex-direction:column;background:#fff}
        .dsim .wc-toolbar{padding:10px 15px;display:flex;gap:15px;color:#666}
        .dsim .wc-toolbar i{cursor:pointer;font-size:20px;transition:all .3s} .dsim .wc-toolbar i:hover{color:#07C160}
        .dsim .wc-inp{flex:1;padding:0 15px;border:none;resize:none;outline:none;font-size:14px;background:transparent;font-family:inherit}
        .dsim .wc-acts{padding:10px 15px;display:flex;justify-content:flex-end}
        .dsim .wc-send{padding:6px 20px;background:#07C160;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;transition:all .3s}
        .dsim .wc-send:hover{background:#06ad56}
        .dsim .pay-btns{display:flex;gap:8px}
        .dsim .pay-btn{padding:4px 12px;color:#fff;border:none;border-radius:4px;font-size:12px;cursor:pointer;transition:all .2s}
        .dsim .pay-btn:disabled{opacity:.4;cursor:default}
        .dsim .pay-rent{background:#07c160} .dsim .pay-util{background:#409eff}

        /* Weibo */
        .dsim #wb-win{width:1000px;height:700px;top:60px;left:250px}
        .dsim .wb-body{display:flex;flex-direction:column;height:calc(100% - 40px)}
        .dsim .wb-hdr{height:60px;background:rgba(255,255,255,.8);border-bottom:1px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:space-between;padding:0 20px}
        .dsim .wb-logo{font-size:24px;font-weight:bold;color:#E6162D;display:flex;align-items:center;gap:8px}
        .dsim .wb-search{width:300px;height:36px;background:#f0f2f5;border-radius:18px;display:flex;align-items:center;padding:0 15px;gap:10px}
        .dsim .wb-search input{border:none;background:transparent;outline:none;width:100%;font-size:14px}
        .dsim .wb-usr-acts{display:flex;align-items:center;gap:15px}
        .dsim .btn-pub{background:linear-gradient(135deg,#FF6B9D,#9B59B6);color:#fff;border:none;padding:8px 20px;border-radius:20px;cursor:pointer;font-weight:bold;transition:all .3s}
        .dsim .btn-pub:hover{opacity:.9;transform:translateY(-2px)}
        .dsim .wb-main{display:flex;flex:1;overflow:hidden;background:rgba(240,242,245,.5)}
        .dsim .wb-sidebar{width:200px;padding:20px;display:flex;flex-direction:column;gap:20px}
        .dsim .wb-usr-card{background:rgba(255,255,255,.8);border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.05)}
        .dsim .wb-usr-card .avatar{width:60px;height:60px;margin:0 auto 10px;border-radius:50%;background:#FF6B9D;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff}
        .dsim .wb-nav{display:flex;flex-direction:column;gap:10px}
        .dsim .wb-nav-item{display:flex;align-items:center;gap:10px;padding:12px 15px;border-radius:8px;cursor:pointer;transition:all .3s;font-size:16px;color:#333}
        .dsim .wb-nav-item:hover,.dsim .wb-nav-item.active{background:rgba(255,255,255,.8);color:#FF6B9D;font-weight:bold}
        .dsim .wb-feed{flex:1;padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:20px}
        .dsim .wb-post{background:rgba(255,255,255,.9);border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,.05)}
        .dsim .wb-post-hdr{display:flex;align-items:center;gap:10px;margin-bottom:15px}
        .dsim .wb-post-avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:16px;flex-shrink:0}
        .dsim .wb-post-info{display:flex;flex-direction:column}
        .dsim .wb-post-name{font-weight:bold;color:#333;font-size:15px}
        .dsim .wb-post-time{font-size:12px;color:#666}
        .dsim .wb-post-content{font-size:15px;line-height:1.6;color:#333;margin-bottom:15px}
        .dsim .wb-post-acts{display:flex;border-top:1px solid #eee;padding-top:15px}
        .dsim .wb-act{flex:1;display:flex;justify-content:center;align-items:center;gap:5px;color:#666;cursor:pointer;transition:all .3s}
        .dsim .wb-act:hover{color:#FF6B9D} .dsim .wb-act.liked i{color:#E6162D}
        .dsim .wb-comments{margin-top:15px;background:#f9f9f9;border-radius:8px;padding:15px;display:none}
        .dsim .wb-comments.active{display:block}
        .dsim .cmt-item{display:flex;gap:10px;margin-bottom:12px;font-size:14px}
        .dsim .cmt-name{font-weight:bold;color:#4A90E2;margin-right:5px}
        .dsim .cmt-input-area{display:flex;gap:10px;margin-top:12px}
        .dsim .cmt-input-area input{flex:1;padding:8px 15px;border:1px solid #ddd;border-radius:20px;outline:none}
        .dsim .cmt-input-area button{padding:0 15px;background:#4A90E2;color:#fff;border:none;border-radius:20px;cursor:pointer}
        .dsim .wb-right{width:260px;padding:20px;padding-left:0;display:flex;flex-direction:column;gap:20px}
        .dsim .hot-card{background:rgba(255,255,255,.9);border-radius:12px;padding:15px;box-shadow:0 2px 10px rgba(0,0,0,.05)}
        .dsim .card-title{font-size:16px;font-weight:bold;margin-bottom:15px;display:flex;align-items:center;gap:5px}
        .dsim .hot-item{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:14px;padding:4px 0;transition:all .2s}
        .dsim .hot-item:hover .hot-title{color:#FF6B9D}
        .dsim .hot-num{width:20px;text-align:center;font-weight:bold;color:#999}
        .dsim .hot-item:nth-child(1) .hot-num{color:#f5222d} .dsim .hot-item:nth-child(2) .hot-num{color:#fa8c16} .dsim .hot-item:nth-child(3) .hot-num{color:#fadb14}
        .dsim .hot-title{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#333;transition:all .3s}
        .dsim .hot-heat{font-size:12px;color:#666}
        .dsim .hot-detail{display:none;flex-direction:column;width:100%;height:100%}
        .dsim .hot-detail-hdr{padding:15px 20px;background:#fff;border-bottom:1px solid #eee;display:flex;align-items:center;gap:15px}
        .dsim .hot-detail-hdr .btn-back{cursor:pointer;font-size:20px;color:#333}
        .dsim .hot-detail-hdr .hot-detail-title{font-size:18px;font-weight:bold}
        .dsim .hot-detail-feed{flex:1;padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:20px}

        .dsim .pub-modal{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);backdrop-filter:blur(5px);z-index:2000;display:none;align-items:center;justify-content:center}
        .dsim .pub-modal-box{width:500px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.2)}
        .dsim .pub-modal-hdr{height:50px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #eee;font-weight:bold}
        .dsim .pub-modal-close{cursor:pointer;font-size:20px;color:#999}
        .dsim .pub-modal-body{padding:20px}
        .dsim .pub-ta{width:100%;height:150px;border:none;resize:none;outline:none;font-size:16px;font-family:inherit}
        .dsim .pub-modal-ft{display:flex;align-items:center;justify-content:space-between;padding:10px 20px 20px}
        .dsim .pub-tools{display:flex;gap:15px;color:#4A90E2;font-size:20px}
        .dsim .pub-tools i{cursor:pointer}
        .dsim .char-count{color:#999;font-size:12px;margin-right:15px}
        .dsim .btn-do-pub{background:#FF6B9D;color:#fff;border:none;padding:8px 20px;border-radius:20px;cursor:pointer}

        .dsim ::-webkit-scrollbar{width:6px} .dsim ::-webkit-scrollbar-track{background:transparent} .dsim ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.2);border-radius:3px}
      </style>

      <div class="dsim">
        <div class="dsk">
          <div class="dsk-icon wc" id="ds-icon-wc"><i class="ri-wechat-fill"></i><span>微信</span></div>
          <div class="dsk-icon wb" id="ds-icon-wb"><i class="ri-weibo-fill"></i><span>微博</span></div>
        </div>

        <div class="tbar">
          <i class="ri-windows-fill" style="font-size:24px;color:#4A90E2;cursor:pointer"></i>
          <div class="tbar-c">
            <div class="tbar-icon wc" id="ds-task-wc"><i class="ri-wechat-fill"></i></div>
            <div class="tbar-icon wb" id="ds-task-wb"><i class="ri-weibo-fill"></i></div>
          </div>
          <div class="sys-tray">
            <i class="ri-wifi-fill"></i><i class="ri-volume-up-fill"></i><i class="ri-battery-fill"></i>
            <div class="time-date"><span id="ds-time">${timeStr}</span><span id="ds-date">${dateStr}</span></div>
            <button class="close-ds" id="btn-close-ds">关闭电脑</button>
          </div>
        </div>

        <!-- WeChat -->
        <div class="win" id="wc-win">
          <div class="tbar-win" id="wc-tbar">
            <div class="tbar-info"><i class="ri-wechat-fill" style="color:#07C160"></i> 微信</div>
            <div class="win-ctrls"><div class="ctrl-btn" data-win="wc-win"><i class="ri-subtract-line"></i></div><div class="ctrl-btn close" data-win="wc-win"><i class="ri-close-line"></i></div></div>
          </div>
          <div class="wc-body">
            <div class="wc-side">
              <img src="portraits/happy.png" style="width:40px;height:40px;border-radius:8px;object-fit:cover;border:2px solid #fff">
              <i class="ri-chat-3-line active"></i><i class="ri-contacts-line"></i><i class="ri-compass-3-line"></i>
              <div style="flex:1"></div><i class="ri-settings-3-line"></i>
            </div>
            <div class="wc-list">
              <div class="wc-search"><input type="text" placeholder="搜索"></div>
              <div class="wc-contacts" id="ds-contacts"></div>
            </div>
            <div class="wc-chat">
              <div class="wc-chat-hdr" id="ds-chat-hdr"><span class="hdr-name">选择联系人</span><div></div></div>
              <div class="wc-msgs" id="ds-msgs"></div>
              <div class="wc-input-area">
                <div class="wc-toolbar"><i class="ri-emotion-line"></i><i class="ri-folder-2-line"></i><i class="ri-scissors-cut-line"></i><i class="ri-chat-history-line"></i></div>
                <textarea class="wc-inp" id="ds-wc-input" placeholder="输入消息..."></textarea>
                <div class="wc-acts"><button class="wc-send" id="ds-wc-send">发送(S)</button></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weibo -->
        <div class="win" id="wb-win">
          <div class="tbar-win" id="wb-tbar">
            <div class="tbar-info"><i class="ri-weibo-fill" style="color:#E6162D"></i> 微博</div>
            <div class="win-ctrls"><div class="ctrl-btn" data-win="wb-win"><i class="ri-subtract-line"></i></div><div class="ctrl-btn close" data-win="wb-win"><i class="ri-close-line"></i></div></div>
          </div>
          <div class="wb-body">
            <div class="wb-hdr">
              <div class="wb-logo"><i class="ri-weibo-fill"></i> 微博</div>
              <div class="wb-search"><i class="ri-search-line" style="color:#999"></i><input type="text" placeholder="搜索"></div>
              <div class="wb-usr-acts"><button class="btn-pub" id="ds-btn-pub"><i class="ri-quill-pen-line"></i> 发布</button></div>
            </div>
            <div class="wb-main" id="ds-wb-main">
              <div class="wb-sidebar">
                <div class="wb-usr-card">
                  <img src="portraits/happy.png" class="avatar" style="border-radius:50%;object-fit:cover;border:2px solid #fff">
                  <div style="font-weight:bold;margin-bottom:5px">小爱</div>
                  <div style="font-size:12px;color:#999">粉丝 ${state.followers || 0}</div>
                </div>
                <div class="wb-nav">
                  <div class="wb-nav-item active" id="ds-nav-home"><i class="ri-home-5-line"></i> 首页</div>
                  <div class="wb-nav-item"><i class="ri-fire-line"></i> 热门</div>
                  <div class="wb-nav-item"><i class="ri-message-3-line"></i> 消息</div>
                </div>
              </div>
              <div class="wb-feed" id="ds-wb-feed"></div>
              <div class="wb-right">
                <div class="hot-card">
                  <div class="card-title"><i class="ri-fire-fill" style="color:#f5222d"></i> 微博热搜</div>
                  <div class="hot-list" id="ds-hot-list"></div>
                </div>
              </div>
            </div>
            <div class="hot-detail" id="ds-hot-detail">
              <div class="hot-detail-hdr"><i class="ri-arrow-left-line btn-back" id="ds-hot-back"></i><div class="hot-detail-title" id="ds-hot-title"></div></div>
              <div class="hot-detail-feed" id="ds-hot-feed"></div>
            </div>
          </div>
        </div>

        <!-- Publish Modal -->
        <div class="pub-modal" id="ds-pub-modal">
          <div class="pub-modal-box">
            <div class="pub-modal-hdr">发布微博 <i class="ri-close-line pub-modal-close" id="ds-close-pub"></i></div>
            <div class="pub-modal-body"><textarea class="pub-ta" id="ds-pub-input" placeholder="有什么新鲜事想分享？"></textarea></div>
            <div class="pub-modal-ft">
              <div class="pub-tools"><i class="ri-emotion-line"></i><i class="ri-image-line"></i><i class="ri-hashtag"></i></div>
              <div style="display:flex;align-items:center"><span class="char-count" id="ds-pub-count">0/140</span><button class="btn-do-pub" id="ds-do-pub">发布</button></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.showOverlay(html);
    this.openApps.clear();
    const ov = document.getElementById('double-life-overlay');
    if (!ov) return;

    // --- Window toggle ---
    let zIdx = 1000;
    const toggleWin = (winId: string, taskId: string) => {
      const win = ov.querySelector(`#${winId}`) as HTMLElement;
      const task = ov.querySelector(`#${taskId}`) as HTMLElement;
      if (!win) return;
      if (win.style.display === 'flex') { win.style.display = 'none'; task?.classList.remove('active'); }
      else { win.style.display = 'flex'; win.style.zIndex = ++zIdx + ''; task?.classList.add('active'); }
    };
    ov.querySelector('#ds-icon-wc')?.addEventListener('click', () => toggleWin('wc-win', 'ds-task-wc'));
    ov.querySelector('#ds-icon-wb')?.addEventListener('click', () => toggleWin('wb-win', 'ds-task-wb'));
    ov.querySelector('#ds-task-wc')?.addEventListener('click', () => toggleWin('wc-win', 'ds-task-wc'));
    ov.querySelector('#ds-task-wb')?.addEventListener('click', () => toggleWin('wb-win', 'ds-task-wb'));

    // Close/minimize
    ov.querySelectorAll('.ctrl-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const winId = (e.currentTarget as HTMLElement).dataset.win;
        const win = ov.querySelector(`#${winId}`) as HTMLElement;
        if (win) { win.style.display = 'none'; }
        const taskId = winId === 'wc-win' ? 'ds-task-wc' : 'ds-task-wb';
        ov.querySelector(`#${taskId}`)?.classList.remove('active');
      });
    });

    // Draggable
    const makeDraggable = (winId: string, handleId: string) => {
      const win = ov.querySelector(`#${winId}`) as HTMLElement;
      const handle = ov.querySelector(`#${handleId}`) as HTMLElement;
      if (!win || !handle) return;
      let dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
      handle.addEventListener('mousedown', (e) => {
        if ((e.target as HTMLElement).closest('.win-ctrls')) return;
        dragging = true; sx = (e as MouseEvent).clientX; sy = (e as MouseEvent).clientY;
        const r = win.getBoundingClientRect(); sl = r.left; st = r.top;
        win.style.zIndex = ++zIdx + '';
      });
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        win.style.left = Math.max(0, sl + e.clientX - sx) + 'px';
        win.style.top = Math.max(0, st + e.clientY - sy) + 'px';
      });
      document.addEventListener('mouseup', () => { dragging = false; });
      win.addEventListener('mousedown', () => { win.style.zIndex = ++zIdx + ''; });
    };
    makeDraggable('wc-win', 'wc-tbar');
    makeDraggable('wb-win', 'wb-tbar');

    // Close desktop
    ov.querySelector('#btn-close-ds')?.addEventListener('click', () => { this.hideOverlay(); this.openApps.clear(); });

    // --- WeChat ---
    let activeChat = npcKeys[0];
    const chatHist: Record<string, {type: string; content: string}[]> = {};
    npcKeys.forEach(k => { chatHist[k] = []; });

    const getNpc = (id: string) => npcList.find(n => n.id === id);
    const getNpcInitialMsg = (id: string) => {
      const msgs: Record<string, string[]> = {
        landlady: ['小姑娘，房租是每月3000，按天算就是每天100。别忘了按时交租，不然...你懂的。'],
        kexin: ['嗨！我是可心，刚搬来隔壁。听说你也是主播？以后多多关照啦！'],
        mom: ['小爱，最近过得怎么样？不要太累了，注意身体。'],
        yueya: ['你好，我是月牙儿。听说你最近刚开始直播？加油吧，新人~'],
        doudou: ['汪汪！（摇尾巴）'],
      };
      if (id === 'landlady' && survival.rentDue > 0) return [`你已经拖欠房租${survival.rentDue}天了，请尽快缴纳！`];
      return msgs[id] || ['...'];
    };

    const renderContacts = () => {
      const list = ov.querySelector('#ds-contacts') as HTMLElement;
      if (!list) return;
      list.innerHTML = npcList.map(npc => {
        const hist = chatHist[npc.id];
        const lastMsg = hist.length > 0 ? hist[hist.length - 1].content : npc.lastMsg;
        return `<div class="wc-ct ${npc.id === activeChat ? 'active' : ''}" data-npc="${npc.id}">
          <div class="wc-avatar" style="background:${npc.color}">${npc.name[0]}</div>
          <div class="wc-ct-info"><div class="wc-ct-name">${npc.name}</div><div class="wc-ct-msg">${lastMsg}</div></div>
        </div>`;
      }).join('');
      list.querySelectorAll('.wc-ct').forEach(ct => {
        ct.addEventListener('click', () => {
          activeChat = (ct as HTMLElement).dataset.npc || npcKeys[0];
          renderContacts();
          renderChat();
        });
      });
    };

    const renderChat = () => {
      const npc = getNpc(activeChat);
      if (!npc) return;
      const hdr = ov.querySelector('#ds-chat-hdr') as HTMLElement;
      const isLandlady = activeChat === 'landlady';
      const canRent = isLandlady && survival.rentDue > 0 && state.income >= 100;
      const canUtil = isLandlady && survival.utilitiesDue > 0 && state.income >= 20;
      hdr.innerHTML = `<span class="hdr-name">${npc.name}</span>
        ${isLandlady ? `<div class="pay-btns">
          <button class="pay-btn pay-rent" id="ds-pay-rent" ${!canRent ? 'disabled' : ''}>交房租 ¥100</button>
          <button class="pay-btn pay-util" id="ds-pay-util" ${!canUtil ? 'disabled' : ''}>交水电 ¥20</button>
        </div>` : ''}`;

      // Pay rent handlers
      if (isLandlady) {
        hdr.querySelector('#ds-pay-rent')?.addEventListener('click', () => {
          if (state.income >= 100) {
            this.playerData.addIncome(-100);
            this.playerData.updateSurvival('rentDue', -1);
            addMsg('player', '房东太太，这是房租¥100。');
            setTimeout(() => addMsg('npc', '收到，记得按时交租哦。'), 500);
          }
        });
        hdr.querySelector('#ds-pay-util')?.addEventListener('click', () => {
          if (state.income >= 20) {
            this.playerData.addIncome(-20);
            this.playerData.updateSurvival('utilitiesDue', -1);
            addMsg('player', '房东太太，这是水电费¥20。');
            setTimeout(() => addMsg('npc', '好的，水电费已收到。'), 500);
          }
        });
      }

      const msgs = ov.querySelector('#ds-msgs') as HTMLElement;
      msgs.innerHTML = '';
      if (chatHist[activeChat].length === 0) {
        const initial = getNpcInitialMsg(activeChat);
        initial.forEach(m => addMsgToDom('npc', m, npc));
      } else {
        chatHist[activeChat].forEach(m => {
          const n = m.type === 'npc' ? npc : null;
          addMsgToDom(m.type, m.content, n);
        });
      }
      msgs.scrollTop = msgs.scrollHeight;
    };

    const addMsgToDom = (type: string, content: string, npc?: { name: string; color: string } | null) => {
      const msgs = ov.querySelector('#ds-msgs');
      if (!msgs) return;
      const div = document.createElement('div');
      div.className = `msg ${type}`;
      const avatarHtml = type === 'npc'
        ? `<div class="wc-avatar" style="background:${npc?.color || '#999'};width:36px;height:36px;flex-shrink:0">${(npc?.name || '?')[0]}</div>`
        : `<img src="portraits/happy.png" style="width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0">`;
      div.innerHTML = `${type === 'npc' ? avatarHtml : ''}<div class="msg-bubble">${content}</div>${type === 'player' ? avatarHtml : ''}`;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    };

    const addMsg = (type: string, content: string) => {
      chatHist[activeChat].push({ type, content });
      const npc = type === 'npc' ? getNpc(activeChat) : null;
      addMsgToDom(type, content, npc);
      renderContacts();
    };

    const sendWcMsg = () => {
      const input = ov.querySelector('#ds-wc-input') as HTMLTextAreaElement;
      const text = input.value.trim();
      if (!text) return;
      addMsg('player', text);
      input.value = '';
      setTimeout(() => {
        const npc = getNpc(activeChat);
        if (!npc) return;
        const reply = npc.msgs[Math.floor(Math.random() * npc.msgs.length)];
        addMsg('npc', reply);
      }, 800 + Math.random() * 800);
    };
    ov.querySelector('#ds-wc-send')?.addEventListener('click', sendWcMsg);
    ov.querySelector('#ds-wc-input')?.addEventListener('keypress', (e) => { if ((e as KeyboardEvent).key === 'Enter' && !(e as KeyboardEvent).shiftKey) { e.preventDefault(); sendWcMsg(); } });

    renderContacts();
    renderChat();

    // --- Weibo ---
    const renderWbPosts = (containerId: string, posts = weiboPosts) => {
      const container = ov.querySelector(`#${containerId}`) as HTMLElement;
      if (!container) return;
      container.innerHTML = posts.map(post => `
        <div class="wb-post" data-pid="${post.id}">
          <div class="wb-post-hdr">
            <div class="wb-post-avatar" style="background:${post.color}">${post.author[0]}</div>
            <div class="wb-post-info"><div class="wb-post-name">${post.author}</div><div class="wb-post-time">${post.time}</div></div>
          </div>
          <div class="wb-post-content">${post.content}</div>
          <div class="wb-post-acts">
            <div class="wb-act ds-act-share" data-pid="${post.id}"><i class="ri-share-forward-line"></i> <span>${post.shares}</span></div>
            <div class="wb-act ds-act-comment" data-pid="${post.id}"><i class="ri-chat-1-line"></i> <span>${post.comments.length}</span></div>
            <div class="wb-act ds-act-like" data-pid="${post.id}"><i class="ri-heart-3-line"></i> <span>${post.likes}</span></div>
          </div>
          <div class="wb-comments" id="ds-cmts-${post.id}">
            ${post.comments.map(c => `<div class="cmt-item"><div><span class="cmt-name">${c.name}:</span>${c.content}</div></div>`).join('')}
            <div class="cmt-input-area"><input type="text" placeholder="发表评论..." class="ds-cmt-input" data-pid="${post.id}"><button class="ds-cmt-send" data-pid="${post.id}">发送</button></div>
          </div>
        </div>`).join('');

      // Like/share/comment
      container.querySelectorAll('.ds-act-like').forEach(btn => {
        btn.addEventListener('click', () => {
          const pid = parseInt((btn as HTMLElement).dataset.pid || '0');
          const post = weiboPosts.find(p => p.id === pid);
          if (!post) return;
          const isLiked = btn.classList.contains('liked');
          if (isLiked) { btn.classList.remove('liked'); post.likes--; (btn.querySelector('i') as HTMLElement).className = 'ri-heart-3-line'; }
          else { btn.classList.add('liked'); post.likes++; (btn.querySelector('i') as HTMLElement).className = 'ri-heart-3-fill'; }
          btn.querySelector('span')!.textContent = post.likes + '';
        });
      });
      container.querySelectorAll('.ds-act-share').forEach(btn => {
        btn.addEventListener('click', () => {
          const pid = parseInt((btn as HTMLElement).dataset.pid || '0');
          const post = weiboPosts.find(p => p.id === pid);
          if (post) { post.shares++; btn.querySelector('span')!.textContent = post.shares + ''; }
        });
      });
      container.querySelectorAll('.ds-act-comment').forEach(btn => {
        btn.addEventListener('click', () => {
          const pid = (btn as HTMLElement).dataset.pid;
          const cmtArea = ov.querySelector(`#ds-cmts-${pid}`) as HTMLElement;
          if (cmtArea) cmtArea.classList.toggle('active');
        });
      });
      container.querySelectorAll('.ds-cmt-send').forEach(btn => {
        btn.addEventListener('click', () => {
          const pid = parseInt((btn as HTMLElement).dataset.pid || '0');
          const input = ov.querySelector(`.ds-cmt-input[data-pid="${pid}"]`) as HTMLInputElement;
          const text = input.value.trim();
          if (!text) return;
          const post = weiboPosts.find(p => p.id === pid);
          if (post) { post.comments.push({ name: '小爱', content: text }); renderWbPosts(containerId, posts); ov.querySelector(`#ds-cmts-${pid}`)?.classList.add('active'); }
        });
      });
    };

    const renderHotList = () => {
      const list = ov.querySelector('#ds-hot-list') as HTMLElement;
      if (!list) return;
      list.innerHTML = hotSearches.map((h, i) => `
        <div class="hot-item" data-idx="${i}"><div class="hot-num">${i + 1}</div><div class="hot-title">${h.keyword}</div><div class="hot-heat">${(h.heat / 10000).toFixed(1)}万</div></div>
      `).join('');
      list.querySelectorAll('.hot-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt((item as HTMLElement).dataset.idx || '0');
          const hot = hotSearches[idx];
          if (!hot) return;
          (ov.querySelector('#ds-wb-main') as HTMLElement).style.display = 'none';
          (ov.querySelector('#ds-hot-detail') as HTMLElement).style.display = 'flex';
          (ov.querySelector('#ds-hot-title') as HTMLElement).textContent = hot.keyword;
          renderWbPosts('ds-hot-feed', weiboPosts.slice(0, 2));
        });
      });
    };

    // Hot search back
    ov.querySelector('#ds-hot-back')?.addEventListener('click', () => {
      (ov.querySelector('#ds-wb-main') as HTMLElement).style.display = 'flex';
      (ov.querySelector('#ds-hot-detail') as HTMLElement).style.display = 'none';
      renderWbPosts('ds-wb-feed');
    });
    ov.querySelector('#ds-nav-home')?.addEventListener('click', () => {
      (ov.querySelector('#ds-wb-main') as HTMLElement).style.display = 'flex';
      (ov.querySelector('#ds-hot-detail') as HTMLElement).style.display = 'none';
      renderWbPosts('ds-wb-feed');
    });

    // Publish modal
    const pubModal = ov.querySelector('#ds-pub-modal') as HTMLElement;
    const pubInput = ov.querySelector('#ds-pub-input') as HTMLTextAreaElement;
    const pubCount = ov.querySelector('#ds-pub-count') as HTMLElement;
    ov.querySelector('#ds-btn-pub')?.addEventListener('click', () => { pubModal.style.display = 'flex'; });
    ov.querySelector('#ds-close-pub')?.addEventListener('click', () => { pubModal.style.display = 'none'; });
    pubInput?.addEventListener('input', () => { pubCount.textContent = `${pubInput.value.length}/140`; });
    ov.querySelector('#ds-do-pub')?.addEventListener('click', () => {
      const text = pubInput.value.trim();
      if (!text) return;
      weiboPosts.unshift({ id: Date.now(), author: '小爱', color: '#FF6B9D', time: '刚刚', content: text, likes: 0, comments: [], shares: 0 });
      this.playerData.addFollowers(Math.floor(Math.random() * 50) + 20);
      pubModal.style.display = 'none'; pubInput.value = ''; pubCount.textContent = '0/140';
      renderWbPosts('ds-wb-feed');
    });

    renderWbPosts('ds-wb-feed');
    renderHotList();

    // Update clock
    setInterval(() => {
      const n = new Date();
      const te = ov.querySelector('#ds-time'); const de = ov.querySelector('#ds-date');
      if (te) te.textContent = `${n.getHours().toString().padStart(2, '0')}:${n.getMinutes().toString().padStart(2, '0')}`;
    }, 60000);
  }
}
