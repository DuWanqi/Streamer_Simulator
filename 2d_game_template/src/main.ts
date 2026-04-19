/**
 * 主播模拟器 - 主入口
 * 支持原版模式和双面人生模式
 */

import { Game } from './game/Game';
import { createDoubleLifeGame } from './game/DoubleLifeGame';
import { logger } from './core/DebugLogger';

// 游戏模式类型
type GameMode = 'original' | 'double-life';

// 创建模式选择界面
function createModeSelector(): Promise<GameMode> {
  return new Promise((resolve) => {
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) {
      resolve('original');
      return;
    }

    // 清空容器
    uiContainer.innerHTML = '';

    // 创建模式选择界面
    uiContainer.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%);
        color: #fff;
      ">
        <h1 style="
          font-size: 48px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #ffb6c1, #87ceeb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        ">主播模拟器</h1>
        <p style="font-size: 18px; color: #b0b0b0; margin-bottom: 60px;">选择游戏模式</p>
        
        <div style="display: flex; gap: 40px;">
          <!-- 原版模式 -->
          <button id="btn-original" style="
            width: 300px;
            padding: 40px 30px;
            border: 2px solid rgba(255, 182, 193, 0.3);
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
          ">
            <div style="font-size: 24px; font-weight: bold; color: #ffb6c1; margin-bottom: 12px;">📺 经典模式</div>
            <div style="font-size: 14px; color: #b0b0b0; line-height: 1.6;">
              原版主播模拟器体验<br>
              技能树、直播PK、粉丝经营<br>
              成为顶级主播的励志之路
            </div>
          </button>
          
          <!-- 双面人生模式 -->
          <button id="btn-double-life" style="
            width: 300px;
            padding: 40px 30px;
            border: 2px solid rgba(135, 206, 235, 0.3);
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
          ">
            <div style="font-size: 24px; font-weight: bold; color: #87ceeb; margin-bottom: 12px;">🎭 双面人生</div>
            <div style="font-size: 14px; color: #b0b0b0; line-height: 1.6;">
              全新剧情驱动模式<br>
              6个剧情节点、30个随机事件<br>
              在虚拟与现实间寻找自我
            </div>
          </button>
        </div>
        
        <div style="margin-top: 60px; font-size: 12px; color: #808080;">
          提示：双面人生模式包含生存压力、NPC互动、多结局系统
        </div>
      </div>
    `;

    // 添加按钮事件
    const btnOriginal = document.getElementById('btn-original');
    const btnDoubleLife = document.getElementById('btn-double-life');

    btnOriginal?.addEventListener('click', () => {
      resolve('original');
    });

    btnDoubleLife?.addEventListener('click', () => {
      resolve('double-life');
    });

    // 添加悬停效果
    [btnOriginal, btnDoubleLife].forEach(btn => {
      btn?.addEventListener('mouseenter', () => {
        (btn as HTMLElement).style.transform = 'translateY(-5px)';
        (btn as HTMLElement).style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
      });
      btn?.addEventListener('mouseleave', () => {
        (btn as HTMLElement).style.transform = 'translateY(0)';
        (btn as HTMLElement).style.boxShadow = 'none';
      });
    });
  });
}

async function main() {
  logger.log('info', 'Main', '游戏启动');

  // 移除加载提示
  const loading = document.querySelector('.loading');
  if (loading) loading.remove();

  // 显示模式选择
  const mode = await createModeSelector();
  
  logger.log('info', 'Main', `选择模式: ${mode}`);

  if (mode === 'double-life') {
    // 启动双面人生模式
    try {
      const game = createDoubleLifeGame({
        containerId: 'ui-container',
        characterBasePath: '/prepared_assets/半身像/',
        onGameEnd: (result) => {
          console.log('游戏结束', result);
        }
      });
      
      await game.init();
      await game.start();
      
      (window as any).doubleLifeGame = game;
      logger.log('info', 'Main', '双面人生模式启动成功');
    } catch (error) {
      logger.log('error', 'Main', '双面人生模式启动失败', { error });
      // 失败时回退到原版
      const game = new Game();
      await game.init();
      (window as any).game = game;
    }
  } else {
    // 启动原版模式
    const game = new Game();
    await game.init();
    (window as any).game = game;
    logger.log('info', 'Main', '经典模式启动成功');
  }
}

main().catch(console.error);
