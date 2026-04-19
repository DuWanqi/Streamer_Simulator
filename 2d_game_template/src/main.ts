/**
 * 主播模拟器 - 主入口
 * 双面人生功能已整合到Game.ts中
 */

import { Game } from './game/Game';
import { logger } from './core/DebugLogger';
import { gameLogger } from './utils/GameLogger';

async function main() {
  logger.log('info', 'Main', '游戏启动');

  // 移除加载提示
  const loading = document.querySelector('.loading');
  if (loading) loading.remove();

  // 启动原版游戏（双面人生功能已整合其中）
  const game = new Game();
  
  // 设置游戏日志引用
  gameLogger.setPlayerData(game['playerData']);
  
  await game.init();
  (window as any).game = game;
  
  logger.log('info', 'Main', '游戏启动成功');
  gameLogger.info('SYSTEM', '游戏初始化完成');
}

main().catch(console.error);
